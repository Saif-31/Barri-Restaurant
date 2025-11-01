// Check if menu items contain specific allergens
// Queries menu items for allergen information

import { sql } from '@vercel/postgres';

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

  const { item_name, allergens } = req.body;

  // Validate inputs
  if (!item_name || !allergens || !Array.isArray(allergens)) {
    return res.status(400).json({
      error: 'Missing or invalid parameters',
      required: ['item_name', 'allergens (array)']
    });
  }

  try {
    // Query for the menu item
    const result = await sql`
      SELECT
        mi.id,
        mi.name,
        mi.description,
        mi.allergens,
        mi.dietary_flags,
        mc.name as category_name
      FROM menu_items mi
      JOIN menu_categories mc ON mi.category_id = mc.id
      WHERE LOWER(mi.name) = LOWER(${item_name})
      AND mi.available = true
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Menu item not found',
        item_name,
        message: `Sorry, I couldn't find "${item_name}" on our menu. Could you try a different item?`
      });
    }

    const menuItem = result.rows[0];
    const itemAllergens = menuItem.allergens || [];

    // Check which allergens from the request are present in the item
    const foundAllergens = allergens.filter(allergen =>
      itemAllergens.some(itemAllergen =>
        itemAllergen.toLowerCase() === allergen.toLowerCase()
      )
    );

    const hasAllergens = foundAllergens.length > 0;

    // Build response message
    let message;
    if (hasAllergens) {
      message = `Warning: "${menuItem.name}" contains ${foundAllergens.join(', ')}. `;
      message += 'Would you like me to suggest alternative items without these allergens?';
    } else {
      message = `Good news! "${menuItem.name}" does not contain ${allergens.join(', ')}. `;
      if (itemAllergens.length > 0) {
        message += `However, it does contain: ${itemAllergens.join(', ')}.`;
      }
    }

    return res.status(200).json({
      item_name: menuItem.name,
      category: menuItem.category_name,
      description: menuItem.description,
      allergens_checked: allergens,
      item_allergens: itemAllergens,
      found_allergens: foundAllergens,
      has_allergens: hasAllergens,
      dietary_flags: menuItem.dietary_flags || [],
      safe: !hasAllergens,
      message
    });

  } catch (error) {
    console.error('Check allergens error:', error);
    return res.status(500).json({
      error: 'Failed to check allergens',
      message: 'Unable to verify allergen information at this time. For your safety, please call us directly at +356 2133 7367.'
    });
  }
}
