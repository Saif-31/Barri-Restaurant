-- Database Schema for Il-Barri Restaurant Voice AI System
-- Malta Restaurant Reservation & Ordering System

-- Menu Categories
CREATE TABLE IF NOT EXISTS menu_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_mt VARCHAR(100), -- Maltese translation
  description TEXT,
  display_order INT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  category_id INT REFERENCES menu_categories(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  name_mt VARCHAR(200), -- Maltese translation
  description TEXT,
  description_mt TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(500),
  allergens TEXT[], -- Array: ['gluten', 'dairy', 'shellfish', 'nuts', 'eggs', 'fish']
  dietary_flags TEXT[], -- Array: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free']
  available BOOLEAN DEFAULT true,
  popular BOOLEAN DEFAULT false,
  spicy_level INT CHECK (spicy_level >= 0 AND spicy_level <= 3),
  prep_time_minutes INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reservations
CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  confirmation_code VARCHAR(20) UNIQUE NOT NULL,
  customer_name VARCHAR(200) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(200),
  party_size INT NOT NULL CHECK (party_size > 0 AND party_size <= 20),
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  special_requests TEXT,
  dietary_restrictions TEXT[],
  occasion VARCHAR(100), -- 'birthday', 'anniversary', 'business', etc.
  status VARCHAR(50) DEFAULT 'confirmed', -- confirmed, cancelled, completed, no-show
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  session_id VARCHAR(100) -- Track which AI session created it
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(20) UNIQUE NOT NULL,
  customer_name VARCHAR(200) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(200),
  order_type VARCHAR(20) NOT NULL CHECK (order_type IN ('delivery', 'pickup')),
  delivery_address TEXT,
  delivery_city VARCHAR(100),
  delivery_postal_code VARCHAR(20),
  total_amount DECIMAL(10, 2) NOT NULL,
  special_instructions TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, preparing, ready, delivered, cancelled
  estimated_time_minutes INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  session_id VARCHAR(100)
);

-- Order Items (junction table)
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id INT REFERENCES menu_items(id),
  menu_item_name VARCHAR(200) NOT NULL, -- Denormalized for historical accuracy
  quantity INT NOT NULL CHECK (quantity > 0),
  modifications TEXT, -- "No onions, extra cheese"
  item_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table Availability
CREATE TABLE IF NOT EXISTS table_availability (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  time_slot TIME NOT NULL,
  available_tables INT NOT NULL CHECK (available_tables >= 0),
  max_party_size INT NOT NULL CHECK (max_party_size > 0),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(date, time_slot)
);

-- Restaurant Configuration
CREATE TABLE IF NOT EXISTS restaurant_config (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id, available);
CREATE INDEX IF NOT EXISTS idx_menu_items_popular ON menu_items(popular, available);
CREATE INDEX IF NOT EXISTS idx_reservations_datetime ON reservations(reservation_date, reservation_time);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_confirmation ON reservations(confirmation_code);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_table_availability_datetime ON table_availability(date, time_slot);

-- Insert Restaurant Configuration
INSERT INTO restaurant_config (key, value, description) VALUES
  ('restaurant_name', 'Il-Barri Restaurant', 'Restaurant name'),
  ('restaurant_address', '81 Old Theatre Street, Valletta VLT 1429, Malta', 'Full address'),
  ('restaurant_phone', '+356 2133 7367', 'Contact phone number'),
  ('restaurant_email', 'reservations@ilbarri.mt', 'Contact email'),
  ('opening_hours_lunch', '12:00-14:30', 'Lunch service hours'),
  ('opening_hours_dinner', '19:00-22:00', 'Dinner service hours'),
  ('min_party_size', '1', 'Minimum party size'),
  ('max_party_size', '12', 'Maximum party size for regular bookings'),
  ('reservation_advance_days', '30', 'How many days in advance reservations can be made'),
  ('delivery_radius_km', '5', 'Delivery radius in kilometers'),
  ('min_order_delivery_eur', '15', 'Minimum order for delivery'),
  ('delivery_fee_eur', '3', 'Delivery fee'),
  ('avg_prep_time_minutes', '30', 'Average order preparation time')
ON CONFLICT (key) DO NOTHING;
