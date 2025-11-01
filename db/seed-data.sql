-- Sample Data for Il-Barri Restaurant
-- Traditional Maltese and Mediterranean Cuisine

-- Insert Menu Categories
INSERT INTO menu_categories (id, name, name_mt, description, display_order, active) VALUES
  (1, 'Starters & Appetizers', 'Antipasti', 'Traditional and Mediterranean appetizers to start your meal', 1, true),
  (2, 'Traditional Maltese', 'Ikel Malti Tradizzjonali', 'Authentic Maltese dishes passed down through generations', 2, true),
  (3, 'Fresh Seafood', 'Ħut Frisk', 'Locally caught fresh fish and seafood from Mediterranean waters', 3, true),
  (4, 'Mediterranean Mains', 'Platti Ewlenin', 'Classic Mediterranean cuisine with Italian and Provençal influences', 4, true),
  (5, 'Desserts', 'Dolċi', 'Traditional sweets and contemporary desserts', 5, true),
  (6, 'Beverages', 'Xorb', 'Wines, soft drinks, and local beverages', 6, true);

-- Insert Menu Items

-- STARTERS & APPETIZERS (Category 1)
INSERT INTO menu_items (category_id, name, name_mt, description, price, allergens, dietary_flags, popular, spicy_level, prep_time_minutes) VALUES
  (1, 'Bigilla', 'Bigilla', 'Traditional Maltese bean dip made with crushed broad beans, garlic, fresh herbs, and olive oil. Served with Maltese bread.', 6.50, ARRAY['gluten'], ARRAY['vegetarian', 'vegan'], true, 0, 5),
  (1, 'Pastizzi tal-Pizelli', 'Pastizzi tal-Pizelli', 'Golden flaky pastry filled with spiced mushy peas. A beloved Maltese street food classic.', 5.00, ARRAY['gluten'], ARRAY['vegetarian', 'vegan'], true, 0, 8),
  (1, 'Pastizzi tal-Irkotta', 'Pastizzi tal-Irkotta', 'Crispy pastry parcels filled with creamy ricotta cheese. Perfect starter or snack.', 5.50, ARRAY['gluten', 'dairy'], ARRAY['vegetarian'], true, 0, 8),
  (1, 'Ġbejna Maltija', 'Ġbejna Maltija', 'Traditional Maltese sheep cheese, either fresh or sun-dried, drizzled with local olive oil and served with galletti crackers.', 8.50, ARRAY['dairy', 'gluten'], ARRAY['vegetarian'], true, 0, 5),
  (1, 'Bruschetta Maltija', 'Bruschetta Maltija', 'Grilled Maltese bread topped with fresh tomatoes, bigilla, sun-dried tomatoes, capers, and olives.', 7.50, ARRAY['gluten'], ARRAY['vegetarian', 'vegan'], false, 0, 10),
  (1, 'Octopus Salad', 'Insalata tal-Qarnita', 'Tender octopus with cherry tomatoes, capers, olives, red onion, and lemon dressing.', 12.00, ARRAY[], ARRAY[], false, 0, 15),

-- TRADITIONAL MALTESE (Category 2)
  (2, 'Stuffat tal-Fenek', 'Stuffat tal-Fenek', 'Malta''s national dish - tender rabbit slow-cooked in red wine, tomatoes, garlic, bay leaves, and Mediterranean herbs. Served with Maltese bread or pasta.', 18.50, ARRAY['gluten'], ARRAY[], true, 0, 45),
  (2, 'Fenek Moqli', 'Fenek Moqli', 'Crispy fried rabbit marinated in garlic and herbs. A traditional favorite at village festas.', 19.00, ARRAY[], ARRAY[], true, 0, 35),
  (2, 'Braġjoli', 'Braġjoli', 'Beef olives - thin beef rolls stuffed with breadcrumbs, bacon, hard-boiled eggs, and herbs, braised in rich wine sauce.', 17.50, ARRAY['gluten', 'eggs'], ARRAY[], false, 0, 50),
  (2, 'Ross il-Forn', 'Ross il-Forn', 'Baked rice casserole with minced beef, tomato sauce, eggs, and saffron. Comfort food at its finest.', 14.00, ARRAY['gluten', 'eggs'], ARRAY[], false, 0, 40),
  (2, 'Timpana', 'Timpana', 'Baked pasta pie with macaroni, bolognese sauce, chicken livers, and eggs encased in crispy pastry.', 15.50, ARRAY['gluten', 'eggs'], ARRAY[], false, 0, 45),
  (2, 'Kapunata', 'Kapunata', 'Maltese ratatouille with eggplant, peppers, tomatoes, capers, olives, and herbs. Can be served hot or cold.', 12.00, ARRAY[], ARRAY['vegetarian', 'vegan'], false, 0, 30),

-- FRESH SEAFOOD (Category 3)
  (3, 'Lampuki Pie', 'Torta tal-Lampuki', 'Traditional Maltese pie with fresh dorado fish, spinach, tomatoes, olives, capers, and herbs in golden pastry. Seasonal specialty.', 19.50, ARRAY['gluten', 'fish'], ARRAY[], true, 0, 40),
  (3, 'Grilled Lampuki', 'Lampuki Mixwi', 'Fresh dorado fillet grilled with lemon, garlic, and herbs. Served with seasonal vegetables and roasted potatoes.', 22.00, ARRAY['fish'], ARRAY[], true, 0, 25),
  (3, 'Aljotta', 'Aljotta', 'Traditional Maltese fish soup with mixed fresh fish, tomatoes, garlic, rice, and herbs. Light yet flavorful.', 14.50, ARRAY['fish'], ARRAY[], false, 0, 30),
  (3, 'Grilled Swordfish Steak', 'Pixxispad Mixwi', 'Thick swordfish steak grilled to perfection, served with Mediterranean vegetables and lemon butter sauce.', 24.00, ARRAY['fish'], ARRAY[], false, 0, 20),
  (3, 'Octopus Stew', 'Stuffat tal-Qarnita', 'Tender octopus braised with potatoes, peas, wine, tomatoes, and herbs. A coastal favorite.', 20.00, ARRAY[], ARRAY[], false, 0, 60),
  (3, 'Fried Calamari', 'Klamari Moqli', 'Crispy fried squid rings served with garlic aioli and lemon wedges.', 13.50, ARRAY['gluten'], ARRAY[], false, 0, 15),

-- MEDITERRANEAN MAINS (Category 4)
  (4, 'Grilled Ribeye Steak', 'Steak Mixwi', 'Premium 300g ribeye steak grilled to your preference, served with roasted potatoes and seasonal vegetables.', 28.00, ARRAY[], ARRAY[], false, 0, 25),
  (4, 'Chicken Breast Mediterranean Style', 'Sider tat-Tiġieġa', 'Pan-seared chicken breast with sun-dried tomatoes, olives, capers, white wine, and herbs.', 16.50, ARRAY[], ARRAY[], false, 0, 25),
  (4, 'Pasta Bolognese', 'Pasta bil-Bolognese', 'Classic Italian meat sauce with fresh pasta, parmesan, and basil.', 13.00, ARRAY['gluten', 'dairy'], ARRAY[], false, 0, 20),
  (4, 'Pasta Carbonara', 'Pasta Carbonara', 'Creamy egg and bacon sauce with parmesan and black pepper on fresh pasta.', 14.00, ARRAY['gluten', 'dairy', 'eggs'], ARRAY[], false, 0, 18),
  (4, 'Vegetarian Risotto', 'Riżott Veġetarjan', 'Creamy arborio rice with seasonal vegetables, parmesan, white wine, and herbs.', 13.50, ARRAY['dairy'], ARRAY['vegetarian'], false, 0, 30),
  (4, 'Penne Arrabbiata', 'Penne Arrabbiata', 'Spicy tomato sauce with garlic, chili, and fresh basil on penne pasta.', 12.00, ARRAY['gluten'], ARRAY['vegetarian', 'vegan'], false, 2, 18),
  (4, 'Margherita Pizza', 'Pizza Margherita', 'Classic wood-fired pizza with tomato sauce, mozzarella, fresh basil, and olive oil.', 11.50, ARRAY['gluten', 'dairy'], ARRAY['vegetarian'], false, 0, 15),
  (4, 'Maltese Pizza', 'Pizza Maltija', 'Topped with ġbejna (Maltese cheese), sun-dried tomatoes, olives, capers, and local sausage.', 14.50, ARRAY['gluten', 'dairy'], ARRAY[], true, 0, 15),

-- DESSERTS (Category 5)
  (5, 'Imqaret', 'Imqaret', 'Traditional Maltese date-filled pastries, deep-fried and served warm with vanilla ice cream.', 6.50, ARRAY['gluten'], ARRAY['vegetarian'], true, 0, 10),
  (5, 'Kannoli Siċiljani', 'Kannoli Siċiljani', 'Crispy pastry tubes filled with sweet ricotta cream, chocolate chips, and candied fruit.', 7.00, ARRAY['gluten', 'dairy'], ARRAY['vegetarian'], true, 0, 8),
  (5, 'Tiramisu', 'Tiramisù', 'Classic Italian dessert with espresso-soaked ladyfingers, mascarpone cream, and cocoa.', 7.50, ARRAY['gluten', 'dairy', 'eggs'], ARRAY['vegetarian'], false, 0, 5),
  (5, 'Ħelwa tat-Tork', 'Ħelwa tat-Tork', 'Traditional Maltese halva made with crushed almonds and sugar. Rich and crumbly.', 5.50, ARRAY['nuts'], ARRAY['vegetarian', 'vegan'], false, 0, 5),
  (5, 'Panna Cotta', 'Panna Cotta', 'Silky Italian cream dessert with berry compote.', 6.50, ARRAY['dairy'], ARRAY['vegetarian'], false, 0, 5),
  (5, 'Gelato Selection', 'Ġelat', 'Three scoops of artisan gelato - choose from chocolate, vanilla, strawberry, pistachio, or lemon.', 6.00, ARRAY['dairy'], ARRAY['vegetarian'], false, 0, 3),

-- BEVERAGES (Category 6)
  (6, 'House Red Wine', 'Inbid Aħmar', 'Local Maltese red wine - glass', 5.50, ARRAY[], ARRAY['vegetarian', 'vegan'], false, 0, 2),
  (6, 'House White Wine', 'Inbid Abjad', 'Local Maltese white wine - glass', 5.50, ARRAY[], ARRAY['vegetarian', 'vegan'], false, 0, 2),
  (6, 'Kinnie', 'Kinnie', 'Malta''s iconic bitter-sweet soft drink made from oranges and herbs.', 3.00, ARRAY[], ARRAY['vegetarian', 'vegan'], true, 0, 2),
  (6, 'Cisk Lager', 'Birra Ċisk', 'Malta''s premium lager beer - bottle', 4.00, ARRAY['gluten'], ARRAY['vegetarian', 'vegan'], false, 0, 2),
  (6, 'Still Water', 'Ilma', 'Bottled still water 750ml', 2.50, ARRAY[], ARRAY['vegetarian', 'vegan'], false, 0, 1),
  (6, 'Sparkling Water', 'Ilma Frizzanti', 'Bottled sparkling water 750ml', 3.00, ARRAY[], ARRAY['vegetarian', 'vegan'], false, 0, 1),
  (6, 'Fresh Orange Juice', 'Meraq tal-Larinġ', 'Freshly squeezed orange juice', 4.50, ARRAY[], ARRAY['vegetarian', 'vegan'], false, 0, 5),
  (6, 'Espresso', 'Espresso', 'Italian-style espresso coffee', 2.50, ARRAY[], ARRAY['vegetarian', 'vegan'], false, 0, 3),
  (6, 'Cappuccino', 'Kappuċċino', 'Espresso with steamed milk and foam', 3.50, ARRAY['dairy'], ARRAY['vegetarian'], false, 0, 4);

-- Generate Table Availability for next 7 days
-- Lunch slots: 12:00 - 14:30 (every 30 minutes)
-- Dinner slots: 19:00 - 22:00 (every 30 minutes)
DO $$
DECLARE
  day_offset INT;
  current_date DATE;
  time_slot TIME;
BEGIN
  FOR day_offset IN 0..6 LOOP
    current_date := CURRENT_DATE + day_offset;

    -- Lunch slots
    FOR time_slot IN
      SELECT generate_series('12:00'::time, '14:30'::time, '30 minutes'::interval)::time
    LOOP
      INSERT INTO table_availability (date, time_slot, available_tables, max_party_size)
      VALUES (current_date, time_slot, 5, 8);
    END LOOP;

    -- Dinner slots
    FOR time_slot IN
      SELECT generate_series('19:00'::time, '22:00'::time, '30 minutes'::interval)::time
    LOOP
      INSERT INTO table_availability (date, time_slot, available_tables, max_party_size)
      VALUES (current_date, time_slot, 6, 8);
    END LOOP;
  END LOOP;
END $$;

-- Insert some mock existing reservations to make it realistic
INSERT INTO reservations (confirmation_code, customer_name, customer_phone, customer_email, party_size, reservation_date, reservation_time, special_requests, dietary_restrictions, occasion, status) VALUES
  ('RES' || LPAD(floor(random() * 10000)::text, 4, '0'), 'John Smith', '+356 9923 4567', 'john.smith@email.com', 4, CURRENT_DATE, '19:30', 'Window table if possible', ARRAY[]::text[], 'anniversary', 'confirmed'),
  ('RES' || LPAD(floor(random() * 10000)::text, 4, '0'), 'Maria Borg', '+356 7745 1234', 'maria.borg@email.mt', 2, CURRENT_DATE + 1, '20:00', NULL, ARRAY['vegetarian'], NULL, 'confirmed'),
  ('RES' || LPAD(floor(random() * 10000)::text, 4, '0'), 'David Camilleri', '+356 9912 8765', 'david.c@email.com', 6, CURRENT_DATE + 2, '19:00', 'Birthday celebration, need high chair', ARRAY[]::text[], 'birthday', 'confirmed'),
  ('RES' || LPAD(floor(random() * 10000)::text, 4, '0'), 'Sarah Thompson', '+356 7734 5678', NULL, 3, CURRENT_DATE + 3, '12:30', NULL, ARRAY['gluten-free'], NULL, 'confirmed'),
  ('RES' || LPAD(floor(random() * 10000)::text, 4, '0'), 'Marco Zammit', '+356 9956 2341', 'marco.z@outlook.com', 5, CURRENT_DATE + 4, '20:30', 'Business dinner', ARRAY[]::text[], 'business', 'confirmed');

-- Update table availability to reflect these bookings (reduce available_tables by 1)
UPDATE table_availability ta
SET available_tables = available_tables - 1
FROM reservations r
WHERE ta.date = r.reservation_date
  AND ta.time_slot = r.reservation_time
  AND r.status = 'confirmed';

-- Insert a few mock completed orders
INSERT INTO orders (order_number, customer_name, customer_phone, order_type, delivery_address, delivery_city, delivery_postal_code, total_amount, status, estimated_time_minutes) VALUES
  ('ORD' || LPAD(floor(random() * 10000)::text, 4, '0'), 'Emma Vella', '+356 9988 7766', 'delivery', '45 Republic Street', 'Valletta', 'VLT 1117', 32.50, 'delivered', 40),
  ('ORD' || LPAD(floor(random() * 10000)::text, 4, '0'), 'Thomas Gauci', '+356 7722 3344', 'pickup', NULL, NULL, NULL, 18.00, 'completed', 25);

-- Mark categories as ready
UPDATE menu_categories SET active = true WHERE active = true;

-- Ensure all data is committed
COMMIT;
