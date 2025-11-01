// Check table availability for reservations
// Queries Vercel Postgres for available tables

import { sql } from '@vercel/postgres';
import { kv } from '@vercel/kv';

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

  const { date, time, party_size } = req.body;

  // Validate inputs
  if (!date || !time || !party_size) {
    return res.status(400).json({
      error: 'Missing required parameters',
      required: ['date', 'time', 'party_size']
    });
  }

  try {
    // Check cache first (Vercel KV) - cache for 2 minutes
    const cacheKey = `availability:${date}:${time}:${party_size}`;
    const cached = await kv.get(cacheKey);

    if (cached) {
      console.log('Cache hit for availability check');
      return res.status(200).json(cached);
    }

    // Query Postgres for availability
    const result = await sql`
      SELECT available_tables, max_party_size
      FROM table_availability
      WHERE date = ${date}
      AND time_slot = ${time}
      AND available_tables > 0
      AND max_party_size >= ${party_size}
      LIMIT 1
    `;

    const available = result.rows.length > 0;
    const response = {
      available,
      date,
      time,
      party_size,
      message: available
        ? `Table available for ${party_size} guests on ${date} at ${time}`
        : `Sorry, no tables available for ${party_size} guests at that time. Would you like to try a different time?`
    };

    // If available, also suggest nearby times
    if (available) {
      response.tables_available = result.rows[0].available_tables;
    }

    // Cache result for 2 minutes
    await kv.set(cacheKey, response, { ex: 120 });

    return res.status(200).json(response);

  } catch (error) {
    console.error('Availability check error:', error);
    return res.status(500).json({
      error: 'Failed to check availability',
      available: false,
      message: 'Unable to check availability at this time. Please try again.'
    });
  }
}
