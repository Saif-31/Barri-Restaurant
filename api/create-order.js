// Create a new food order for delivery or pickup
// Inserts order and order items into Vercel Postgres

import { sql } from '@vercel/postgres';

// Generate random order number
function generateOrderNumber() {
  const chars = '0123456789';
  let code = 'ORD';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Calculate total amount from items (simplified - looks up prices from menu)
async function calculateTotal(items) {
  let total = 0;

  for (const item of items) {
    // Look up item price from database
    const result = await sql`
      SELECT price FROM menu_items
      WHERE LOWER(name) = LOWER(${item.item_name})
      AND available = true
      LIMIT 1
    `;

    if (result.rows.length > 0) {
      const price = parseFloat(result.rows[0].price);
      total += price * item.quantity;
    }
  }

  // Add delivery fee if needed (€3)
  // This would be checked against order_type in the main handler

  return total;
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    customer_name,
    customer_phone,
    customer_email,
    order_type,
    items,
    delivery_address,
    delivery_city,
    delivery_postal_code,
    special_instructions,
    session_id
  } = req.body;

  // Validate required fields
  if (!customer_name || !customer_phone || !order_type || !items || items.length === 0) {
    return res.status(400).json({
      error: 'Missing required parameters',
      required: ['customer_name', 'customer_phone', 'order_type', 'items']
    });
  }

  // Validate order type
  if (!['delivery', 'pickup'].includes(order_type)) {
    return res.status(400).json({
      error: 'Invalid order_type',
      message: 'order_type must be either "delivery" or "pickup"'
    });
  }

  // Validate delivery address for delivery orders
  if (order_type === 'delivery' && !delivery_address) {
    return res.status(400).json({
      error: 'Missing delivery address',
      message: 'Delivery address is required for delivery orders'
    });
  }

  try {
    // Calculate total amount
    let total_amount = await calculateTotal(items);

    // Add delivery fee for delivery orders
    const delivery_fee = 3.00;
    if (order_type === 'delivery') {
      total_amount += delivery_fee;
    }

    // Estimate prep time (30-45 minutes for most orders)
    const estimated_time = 30 + Math.floor(Math.random() * 15);

    // Generate unique order number
    const order_number = generateOrderNumber();

    // Insert order into database
    const orderResult = await sql`
      INSERT INTO orders (
        order_number,
        customer_name,
        customer_phone,
        customer_email,
        order_type,
        delivery_address,
        delivery_city,
        delivery_postal_code,
        total_amount,
        special_instructions,
        status,
        estimated_time_minutes,
        session_id
      ) VALUES (
        ${order_number},
        ${customer_name},
        ${customer_phone},
        ${customer_email || null},
        ${order_type},
        ${delivery_address || null},
        ${delivery_city || null},
        ${delivery_postal_code || null},
        ${total_amount},
        ${special_instructions || null},
        'pending',
        ${estimated_time},
        ${session_id || null}
      )
      RETURNING id, order_number, total_amount, estimated_time_minutes, created_at
    `;

    const order = orderResult.rows[0];
    const order_id = order.id;

    // Insert order items
    for (const item of items) {
      // Get menu item details
      const menuItemResult = await sql`
        SELECT id, name, price
        FROM menu_items
        WHERE LOWER(name) = LOWER(${item.item_name})
        AND available = true
        LIMIT 1
      `;

      if (menuItemResult.rows.length > 0) {
        const menuItem = menuItemResult.rows[0];

        await sql`
          INSERT INTO order_items (
            order_id,
            menu_item_id,
            menu_item_name,
            quantity,
            modifications,
            item_price
          ) VALUES (
            ${order_id},
            ${menuItem.id},
            ${menuItem.name},
            ${item.quantity},
            ${item.modifications || null},
            ${menuItem.price}
          )
        `;
      }
    }

    return res.status(200).json({
      success: true,
      order_number: order.order_number,
      order_id: order.id,
      customer_name,
      order_type,
      total_amount: parseFloat(order.total_amount),
      estimated_time_minutes: order.estimated_time_minutes,
      items: items,
      delivery_address: order_type === 'delivery' ? delivery_address : null,
      special_instructions,
      message: `Order confirmed! Order number: ${order.order_number}. Estimated ${order_type} time: ${order.estimated_time_minutes} minutes.`,
      created_at: order.created_at
    });

  } catch (error) {
    console.error('Create order error:', error);

    return res.status(500).json({
      error: 'Failed to create order',
      message: 'Unable to complete your order at this time. Please try again or call us directly at +356 2133 7367.'
    });
  }
}
