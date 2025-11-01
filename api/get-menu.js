// Get menu items by category or dietary filter
// Queries Vercel Postgres for menu items with caching

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

  const { category, dietary_filter } = req.body;

  try {
    // Build cache key
    const cacheKey = `menu:${category || 'all'}:${dietary_filter || 'none'}`;

    // Check cache first - menu doesn't change often, cache for 1 hour
    const cached = await kv.get(cacheKey);
    if (cached) {
      console.log('Cache hit for menu items');
      return res.status(200).json(cached);
    }

    // Map frontend category names to database category IDs
    const categoryMap = {
      'starters': 1,
      'traditional': 2,
      'seafood': 3,
      'mains': 4,
      'desserts': 5,
      'drinks': 6
    };

    let query;
    let params = [];

    if (category && dietary_filter) {
      // Both category and dietary filter
      const categoryId = categoryMap[category];
      query = sql`
        SELECT
          mi.id, mi.name, mi.description, mi.price,
          mi.allergens, mi.dietary_flags, mi.popular, mi.spicy_level,
          mc.name as category_name
        FROM menu_items mi
        JOIN menu_categories mc ON mi.category_id = mc.id
        WHERE mi.category_id = ${categoryId}
        AND mi.available = true
        AND ${dietary_filter} = ANY(mi.dietary_flags)
        ORDER BY mi.popular DESC, mi.name ASC
      `;
    } else if (category) {
      // Only category
      const categoryId = categoryMap[category];
      query = sql`
        SELECT
          mi.id, mi.name, mi.description, mi.price,
          mi.allergens, mi.dietary_flags, mi.popular, mi.spicy_level,
          mc.name as category_name
        FROM menu_items mi
        JOIN menu_categories mc ON mi.category_id = mc.id
        WHERE mi.category_id = ${categoryId}
        AND mi.available = true
        ORDER BY mi.popular DESC, mi.name ASC
      `;
    } else if (dietary_filter) {
      // Only dietary filter
      query = sql`
        SELECT
          mi.id, mi.name, mi.description, mi.price,
          mi.allergens, mi.dietary_flags, mi.popular, mi.spicy_level,
          mc.name as category_name
        FROM menu_items mi
        JOIN menu_categories mc ON mi.category_id = mc.id
        WHERE mi.available = true
        AND ${dietary_filter} = ANY(mi.dietary_flags)
        ORDER BY mc.display_order, mi.popular DESC, mi.name ASC
      `;
    } else {
      // All items
      query = sql`
        SELECT
          mi.id, mi.name, mi.description, mi.price,
          mi.allergens, mi.dietary_flags, mi.popular, mi.spicy_level,
          mc.name as category_name
        FROM menu_items mi
        JOIN menu_categories mc ON mi.category_id = mc.id
        WHERE mi.available = true
        ORDER BY mc.display_order, mi.popular DESC, mi.name ASC
      `;
    }

    const result = await query;

    const response = {
      category: category || 'all',
      dietary_filter: dietary_filter || null,
      count: result.rows.length,
      items: result.rows.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: parseFloat(item.price),
        category: item.category_name,
        allergens: item.allergens || [],
        dietary_flags: item.dietary_flags || [],
        popular: item.popular,
        spicy_level: item.spicy_level || 0
      }))
    };

    // Cache for 1 hour (menu doesn't change frequently)
    await kv.set(cacheKey, response, { ex: 3600 });

    return res.status(200).json(response);

  } catch (error) {
    console.error('Get menu error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve menu',
      message: 'Unable to fetch menu items at this time. Please try again.'
    });
  }
}
