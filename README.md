# Il-Barri Restaurant - Voice Reservations & Orders

AI-powered voice reservation and ordering system for Il-Barri Restaurant in Valletta, Malta. Built with OpenAI Realtime API, WebRTC, and Vercel serverless infrastructure.

## Features

- **Voice Reservations**: Natural conversation-based table booking system
- **Food Ordering**: Voice-based menu browsing and order placement (delivery/pickup)
- **Menu Inquiries**: Ask about dishes, ingredients, and dietary restrictions
- **Allergen Checking**: Real-time allergen information for menu items
- **Real-time Transcription**: See conversation history as you speak
- **Mediterranean Hospitality**: Warm, welcoming AI persona trained for restaurant service
- **Malta-Specific**: English language, Euro pricing, Malta phone/address formats

## Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3, WebRTC
- **Backend**: Node.js serverless functions (Vercel)
- **AI**: OpenAI Realtime API (GPT-4o with voice)
- **Database**: Vercel Postgres (menu, reservations, orders)
- **Caching**: Vercel KV (Redis)
- **Deployment**: Vercel Platform

## Prerequisites

- Node.js 18+ installed
- OpenAI API key with Realtime API access
- Vercel account (for deployment)
- Modern browser with WebRTC support (Chrome, Firefox, Safari)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Taxi-Dispatcher
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```env
OPENAI_API_KEY="sk-..."
```

### 4. Set Up Vercel Project

```bash
npm install -g vercel
vercel login
vercel link
```

### 5. Set Up Database (Vercel Postgres)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to **Storage** tab
4. Click **Create Database** → Select **Postgres**
5. Follow prompts to create database
6. Vercel will automatically add environment variables

### 6. Set Up Caching (Vercel KV)

1. In Vercel Dashboard → **Storage** tab
2. Click **Create Database** → Select **KV**
3. Follow prompts to create KV store
4. Vercel will automatically add environment variables

### 7. Initialize Database Schema

Connect to your Vercel Postgres database:

```bash
# Option 1: Using Vercel CLI
vercel env pull .env.local
psql $POSTGRES_URL -f db/schema.sql
psql $POSTGRES_URL -f db/seed-data.sql

# Option 2: Using Vercel Dashboard
# Go to Storage → Postgres → Query
# Copy and paste contents of db/schema.sql
# Then copy and paste contents of db/seed-data.sql
```

### 8. Run Locally

```bash
vercel dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 9. Deploy to Production

```bash
npm run deploy
# or
vercel --prod
```

## Project Structure

```
Taxi-Dispatcher/
├── api/                          # Serverless API functions
│   ├── session.js                # OpenAI session creation with system instructions
│   ├── check-availability.js     # Check table availability
│   ├── get-menu.js               # Retrieve menu items
│   ├── create-reservation.js     # Create new reservation
│   ├── create-order.js           # Create food order
│   └── check-allergens.js        # Check allergen information
├── public/                       # Frontend static files
│   ├── index.html                # Main UI
│   ├── app.js                    # WebRTC client & function handlers
│   └── styles.css                # Restaurant-themed styling
├── db/                           # Database files
│   ├── schema.sql                # Database schema
│   └── seed-data.sql             # Sample menu and availability data
├── package.json                  # Dependencies
├── vercel.json                   # Vercel configuration
├── .env.example                  # Environment variables template
└── README.md                     # This file
```

## API Functions

### `POST /api/session`
Creates ephemeral OpenAI Realtime API session with restaurant system instructions.

**Response:**
```json
{
  "client_secret": "...",
  "session_id": "...",
  "expires_at": "2025-..."
}
```

### `POST /api/check-availability`
Check if tables are available for given date/time/party size.

**Request Body:**
```json
{
  "date": "2025-11-01",
  "time": "19:00",
  "party_size": 4
}
```

**Response:**
```json
{
  "available": true,
  "message": "Table available for 4 guests on 2025-11-01 at 19:00",
  "tables_available": 5
}
```

### `POST /api/get-menu`
Retrieve menu items by category or dietary filter.

**Request Body:**
```json
{
  "category": "traditional",
  "dietary_filter": "vegetarian"
}
```

**Response:**
```json
{
  "category": "traditional",
  "count": 2,
  "items": [
    {
      "id": 1,
      "name": "Kapunata",
      "description": "Maltese ratatouille...",
      "price": 12.00,
      "allergens": [],
      "dietary_flags": ["vegetarian", "vegan"],
      "popular": false
    }
  ]
}
```

### `POST /api/create-reservation`
Create a new table reservation.

**Request Body:**
```json
{
  "customer_name": "John Smith",
  "customer_phone": "+356 9923 4567",
  "customer_email": "john@email.com",
  "party_size": 4,
  "reservation_date": "2025-11-01",
  "reservation_time": "19:00",
  "special_requests": "Window table",
  "dietary_restrictions": ["gluten-free"],
  "occasion": "anniversary"
}
```

**Response:**
```json
{
  "success": true,
  "confirmation_code": "RESABC123",
  "message": "Reservation confirmed! Confirmation code: RESABC123"
}
```

### `POST /api/create-order`
Create a new food order.

**Request Body:**
```json
{
  "customer_name": "John Smith",
  "customer_phone": "+356 9923 4567",
  "order_type": "delivery",
  "items": [
    {
      "item_name": "Stuffat tal-Fenek",
      "quantity": 2,
      "modifications": "No garlic"
    }
  ],
  "delivery_address": "45 Republic Street",
  "delivery_city": "Valletta",
  "delivery_postal_code": "VLT 1117"
}
```

**Response:**
```json
{
  "success": true,
  "order_number": "ORD123456",
  "total_amount": 40.00,
  "estimated_time_minutes": 35,
  "message": "Order confirmed! Order number: ORD123456..."
}
```

### `POST /api/check-allergens`
Check if menu item contains specific allergens.

**Request Body:**
```json
{
  "item_name": "Lampuki Pie",
  "allergens": ["gluten", "shellfish"]
}
```

**Response:**
```json
{
  "item_name": "Lampuki Pie",
  "item_allergens": ["gluten", "fish"],
  "found_allergens": ["gluten"],
  "has_allergens": true,
  "safe": false,
  "message": "Warning: Lampuki Pie contains gluten..."
}
```

## Database Schema

### Menu Tables
- **menu_categories**: Categories (Starters, Traditional, Seafood, etc.)
- **menu_items**: Menu items with prices, descriptions, allergens, dietary flags

### Reservation Tables
- **table_availability**: Available time slots per day
- **reservations**: Customer reservations with confirmation codes

### Order Tables
- **orders**: Customer orders (delivery/pickup)
- **order_items**: Individual items per order

### Configuration
- **restaurant_config**: Restaurant settings (hours, fees, etc.)

## Sample Data

The database comes pre-populated with:
- **6 menu categories**: Starters, Traditional Maltese, Seafood, Mains, Desserts, Drinks
- **40+ authentic Maltese menu items**: Stuffat tal-Fenek, Lampuki Pie, Pastizzi, etc.
- **7 days of availability**: Lunch (12:00-14:30) and Dinner (19:00-22:00)
- **Mock reservations**: Pre-existing bookings for realism

## Voice AI Persona

The AI is configured as:
- **Name**: Il-Barri Restaurant Voice Assistant
- **Language**: English (Malta market)
- **Tone**: Warm, welcoming, Mediterranean hospitality
- **Pace**: Moderate (1.0× normal speed)
- **Voice**: Alloy (OpenAI voice model)
- **Specializations**:
  - Menu descriptions (appetizing language)
  - Allergen awareness and safety
  - Special occasion recognition
  - Natural upselling
  - Malta-specific formatting

## Testing the System

### Test Reservation Flow
1. Click "Start Call"
2. Say: "I'd like to make a reservation"
3. Provide: date, time, party size
4. AI will check availability and collect your details
5. Receive confirmation code

### Test Order Flow
1. Click "Start Call"
2. Say: "I'd like to place an order for delivery"
3. Ask about menu: "What traditional dishes do you have?"
4. Order items: "I'll have two portions of rabbit stew"
5. Provide delivery address
6. Receive order number and ETA

### Test Menu Inquiry
1. Click "Start Call"
2. Ask: "Does the lampuki pie contain gluten?"
3. AI will check allergens and inform you

## Environment Variables

Required environment variables:

```env
# OpenAI (Required - set manually)
OPENAI_API_KEY=sk-...

# Vercel Postgres (Auto-configured by Vercel)
POSTGRES_URL=...
POSTGRES_PRISMA_URL=...
POSTGRES_URL_NON_POOLING=...
POSTGRES_USER=...
POSTGRES_HOST=...
POSTGRES_PASSWORD=...
POSTGRES_DATABASE=...

# Vercel KV (Auto-configured by Vercel)
KV_URL=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
```

## Troubleshooting

### "Failed to create session"
- Check that `OPENAI_API_KEY` is set correctly
- Verify API key has Realtime API access
- Check Vercel function logs

### "Failed to check availability"
- Ensure Vercel Postgres is set up
- Verify database schema is initialized
- Check database connection in Vercel logs

### "Microphone permission denied"
- Browser must support WebRTC
- User must grant microphone permission
- Use HTTPS in production (required for mic access)

### Database connection issues
- Ensure Postgres database is created in Vercel
- Check environment variables are synced: `vercel env pull`
- Verify connection pooling settings

## Performance Optimization

- **Menu caching**: Menu items cached for 1 hour in Vercel KV
- **Availability caching**: Availability cached for 2 minutes
- **Database indexes**: Optimized queries on date/time/category
- **Response time target**: < 1 second voice-to-voice latency

## Security Features

- **Rate limiting**: 10 sessions per IP per hour
- **API key protection**: Server-side only, never exposed to client
- **CORS configuration**: Controlled origins
- **Input validation**: All API endpoints validate inputs
- **Ephemeral sessions**: Time-limited OpenAI sessions

## Customization

### Change Restaurant Details
Edit `api/session.js` system instructions:
- Restaurant name
- Location/address
- Menu specialties
- Operating hours

### Modify Menu
Edit `db/seed-data.sql`:
- Add/remove menu items
- Change prices
- Update descriptions

### Adjust Voice Settings
Edit `api/session.js`:
- `voice`: 'alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'
- `temperature`: 0.6-1.0 (lower = more consistent)
- `turn_detection.silence_duration_ms`: Pause before AI responds

## Contributing

This project was converted from a taxi dispatcher demo to a restaurant system. Feel free to adapt it for:
- Other restaurant types
- Different languages/regions
- Hotel concierge services
- Delivery service dispatching
- Customer service applications

## License

ISC

## Support

For issues or questions:
- Check Vercel function logs for backend errors
- Check browser console for frontend errors
- Verify all environment variables are set
- Ensure database is initialized with schema and seed data

---

**Built with ❤️ for Il-Barri Restaurant, Valletta, Malta**

Original taxi dispatcher demo by Umer & Saffi
Converted to restaurant system: 2025
