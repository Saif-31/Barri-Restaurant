// Create a new table reservation
// Inserts reservation into Vercel Postgres and updates availability

import { sql } from '@vercel/postgres';
import { kv } from '@vercel/kv';

// Generate random confirmation code
function generateConfirmationCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'RES';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
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
    party_size,
    reservation_date,
    reservation_time,
    special_requests,
    dietary_restrictions,
    occasion,
    session_id
  } = req.body;

  // Validate required fields
  if (!customer_name || !customer_phone || !party_size || !reservation_date || !reservation_time) {
    return res.status(400).json({
      error: 'Missing required parameters',
      required: ['customer_name', 'customer_phone', 'party_size', 'reservation_date', 'reservation_time']
    });
  }

  try {
    // Generate unique confirmation code
    const confirmation_code = generateConfirmationCode();

    // Insert reservation into database
    const result = await sql`
      INSERT INTO reservations (
        confirmation_code,
        customer_name,
        customer_phone,
        customer_email,
        party_size,
        reservation_date,
        reservation_time,
        special_requests,
        dietary_restrictions,
        occasion,
        status,
        session_id
      ) VALUES (
        ${confirmation_code},
        ${customer_name},
        ${customer_phone},
        ${customer_email || null},
        ${party_size},
        ${reservation_date},
        ${reservation_time},
        ${special_requests || null},
        ${dietary_restrictions ? JSON.stringify(dietary_restrictions) : null},
        ${occasion || null},
        'confirmed',
        ${session_id || null}
      )
      RETURNING id, confirmation_code, created_at
    `;

    // Update table availability (reduce available_tables by 1)
    await sql`
      UPDATE table_availability
      SET available_tables = available_tables - 1
      WHERE date = ${reservation_date}
      AND time_slot = ${reservation_time}
      AND available_tables > 0
    `;

    // Invalidate availability cache for this date/time
    const cachePattern = `availability:${reservation_date}:${reservation_time}:*`;
    // Note: KV doesn't support pattern deletion easily, so we'll let cache expire naturally

    const reservation = result.rows[0];

    return res.status(200).json({
      success: true,
      confirmation_code: reservation.confirmation_code,
      reservation_id: reservation.id,
      customer_name,
      party_size,
      reservation_date,
      reservation_time,
      special_requests,
      dietary_restrictions,
      occasion,
      message: `Reservation confirmed! Confirmation code: ${reservation.confirmation_code}`,
      created_at: reservation.created_at
    });

  } catch (error) {
    console.error('Create reservation error:', error);

    // Check for duplicate confirmation code (unlikely but possible)
    if (error.message && error.message.includes('confirmation_code')) {
      return res.status(500).json({
        error: 'Failed to create reservation',
        message: 'Please try again - confirmation code conflict'
      });
    }

    return res.status(500).json({
      error: 'Failed to create reservation',
      message: 'Unable to complete reservation at this time. Please try again or call us directly at +356 2133 7367.'
    });
  }
}
