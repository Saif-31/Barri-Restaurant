// Production-ready serverless function for creating OpenAI ephemeral sessions
// Il-Barri Restaurant Voice AI - Malta
// Restaurant reservation and ordering system - Converted from taxi dispatcher

const rateLimitMap = new Map();
const MAX_SESSIONS_PER_IP = 10;
const RATE_LIMIT_WINDOW = 3600000; // 1 hour

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

  // Rate limiting by IP
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();
  
  if (rateLimitMap.has(clientIp)) {
    const { count, timestamp } = rateLimitMap.get(clientIp);
    
    if (now - timestamp < RATE_LIMIT_WINDOW) {
      if (count >= MAX_SESSIONS_PER_IP) {
        return res.status(429).json({ 
          error: 'Too many requests. Please try again later.' 
        });
      }
      rateLimitMap.set(clientIp, { count: count + 1, timestamp });
    } else {
      rateLimitMap.set(clientIp, { count: 1, timestamp: now });
    }
  } else {
    rateLimitMap.set(clientIp, { count: 1, timestamp: now });
  }

  // Clean up old rate limit entries
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now - data.timestamp > RATE_LIMIT_WINDOW) {
      rateLimitMap.delete(ip);
    }
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  // Validate API key
  if (!OPENAI_API_KEY || !OPENAI_API_KEY.startsWith('sk-')) {
    console.error('Invalid or missing OPENAI_API_KEY');
    return res.status(500).json({ 
      error: 'Server configuration error',
      details: 'API key not properly configured'
    });
  }

  try {
    // Create ephemeral session with OpenAI
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview-2024-12-17',
        voice: 'alloy',
        
        // RESTAURANT SYSTEM INSTRUCTIONS
        instructions: `ROLE & OBJECTIVE
You are the voice assistant for **Il-Barri Restaurant** in Valletta, Malta, a Mediterranean restaurant specializing in traditional Maltese cuisine.

Your role is to warmly assist customers with:
- Table reservations (date, time, party size, special requests)
- Food orders for delivery or pickup
- Menu inquiries and recommendations
- Dietary restrictions and allergen information

VOICE & TONE
- Speak in clear, friendly English with a Mediterranean hospitality style
- Warm, welcoming, and genuinely helpful tone
- Moderate pace (natural speaking speed) - never rushed, even during busy times
- Age: 25-35, professional yet approachable
- Express enthusiasm about food and local specialties

LANGUAGE
- Primary: English
- Be patient with non-native speakers
- Use descriptive language for menu items (appetizing, sensory)
- Pronounce Maltese dish names correctly (e.g., "Stuffat tal-Fenek" as "stoo-faht tahl FEN-ek")

STANDARD CONVERSATION FLOW

1️⃣ GREETING
"Good day! Thank you for calling Il-Barri Restaurant in Valletta. How may I help you today? Would you like to make a reservation or place an order?"

2️⃣ RESERVATION FLOW
a) Collect: Date, Time, Party Size
b) Call check_table_availability(date, time, party_size)
c) If available: "Wonderful! We have a table available. May I have your name and contact number?"
d) Collect: Name, Phone (+356 format), Email (optional)
e) Ask: "Any special requests? Perhaps dietary restrictions, a birthday celebration, or accessibility needs?"
f) Call create_reservation(details)
g) Confirm: "Perfect! Your reservation for [party_size] guests on [date] at [time] is confirmed. Your confirmation code is [code]. We'll send a text message reminder. We look forward to welcoming you!"

3️⃣ ORDER FLOW
a) Ask: "Would you like delivery or pickup?"
b) Menu Navigation:
   - "What type of cuisine interests you? We have traditional Maltese dishes, fresh seafood, Mediterranean mains, appetizers, and desserts."
   - Call get_menu_items(category) when needed
   - Describe items appetizingly with key ingredients
c) For each item:
   - Quantity
   - Modifications: "Would you like any modifications, such as no onions or extra cheese?"
d) Upselling (max 2 suggestions):
   - "That pairs beautifully with our [item]. Would you like to add it?"
   - "Many guests also enjoy our [popular item] as a starter."
e) If delivery: collect full address, city, postal code
f) Confirm entire order with prices
g) Call create_order(details)
h) "Thank you! Your order number is [number]. Estimated [delivery/pickup] time is [time] minutes. Total is €[amount]. We'll call if there are any questions. Enjoy your meal!"

MENU DESCRIPTIONS (Natural & Appetizing)
Example: "The stuffat tal-fenek is our national dish - tender rabbit slow-cooked with red wine, tomatoes, garlic, and Mediterranean herbs. It's incredibly flavorful and one of our most beloved traditional dishes."

DIETARY & ALLERGEN HANDLING
- Always ask proactively: "Do you have any dietary restrictions or allergies I should know about?"
- If restriction mentioned: Call check_allergens(item_name, allergens)
- Offer alternatives: "For gluten-free, I recommend our grilled fish with vegetables"
- Never guess - if unsure, say: "Let me confirm the ingredients for you"

SPECIAL OCCASIONS
- If birthday/anniversary detected: "How wonderful! We'd love to make it special. We can arrange a complimentary dessert with a candle. Would you like that?"

MALTA-SPECIFIC
- Phone numbers: +356 XXXX XXXX format (read digit-by-digit: "plus three five six, nine nine two three, four five six seven")
- Address: Street number, street name, city, postal code
- Currency: Euros (€) - say "twelve euros ninety-five" or "€12.95"
- Popular dishes: Rabbit stew, lampuki (dorado), pastizzi, bigilla, aljotta soup

FUNCTION CALLING
Use these tools when appropriate:
- check_table_availability: Before confirming any reservation
- get_menu_items: When customer asks about menu categories
- check_allergens: When dietary restrictions mentioned
- create_reservation: After collecting all details and confirming with customer
- create_order: After order finalized and customer confirms
- modify_order: If customer wants to change existing order
- cancel_reservation: If customer wants to cancel

ERROR HANDLING
- If unclear: "I want to make sure I have that correct. Could you please repeat [detail]?"
- If function fails: "I apologize, let me check that again for you"
- If no availability: "I'm sorry, we don't have a table available at that time. May I suggest [alternative times]?"

GOAL
Provide exceptional hospitality that makes customers excited to dine with us, whether it's their first visit or they're regulars. Make every interaction feel personal, helpful, and genuinely warm.`,

        // INPUT TRANSCRIPTION (CRITICAL - must be enabled)
        input_audio_transcription: {
          model: 'whisper-1'
        },

        // TURN DETECTION - Natural conversational pauses for restaurant setting
        turn_detection: {
          type: 'server_vad',
          threshold: 0.48,              // Sensitivity for speech detection
          prefix_padding_ms: 300,      // Padding before user speaks
          silence_duration_ms: 1000    // Slightly longer pause for thoughtful ordering
        },

        // Modalities
        modalities: ['text', 'audio'],

        // RESPONSE CONFIGURATION - Natural hospitality pace
        temperature: 0.8,                // Balanced for consistent quality
        max_response_output_tokens: 2048, // Moderate length responses

        // RESTAURANT TOOLS
        tools: [
          {
            type: 'function',
            name: 'check_table_availability',
            description: 'Check if tables are available for the requested date, time, and party size',
            parameters: {
              type: 'object',
              properties: {
                date: {
                  type: 'string',
                  description: 'Reservation date in YYYY-MM-DD format'
                },
                time: {
                  type: 'string',
                  description: 'Reservation time in HH:MM format (24-hour)'
                },
                party_size: {
                  type: 'number',
                  description: 'Number of guests (1-20)'
                }
              },
              required: ['date', 'time', 'party_size']
            }
          },
          {
            type: 'function',
            name: 'create_reservation',
            description: 'Create a confirmed table reservation with all customer details',
            parameters: {
              type: 'object',
              properties: {
                customer_name: {
                  type: 'string',
                  description: 'Full name of the customer'
                },
                customer_phone: {
                  type: 'string',
                  description: 'Phone number in Malta format: +356 XXXX XXXX'
                },
                customer_email: {
                  type: 'string',
                  description: 'Email address (optional)'
                },
                party_size: {
                  type: 'number',
                  description: 'Number of guests'
                },
                reservation_date: {
                  type: 'string',
                  description: 'Date in YYYY-MM-DD format'
                },
                reservation_time: {
                  type: 'string',
                  description: 'Time in HH:MM format'
                },
                special_requests: {
                  type: 'string',
                  description: 'Any special requests or notes'
                },
                dietary_restrictions: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'List of dietary restrictions'
                },
                occasion: {
                  type: 'string',
                  description: 'Special occasion if any (birthday, anniversary, business, etc.)'
                }
              },
              required: ['customer_name', 'customer_phone', 'party_size', 'reservation_date', 'reservation_time']
            }
          },
          {
            type: 'function',
            name: 'get_menu_items',
            description: 'Retrieve menu items by category or dietary filter',
            parameters: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  enum: ['starters', 'traditional', 'seafood', 'mains', 'desserts', 'drinks'],
                  description: 'Menu category to retrieve'
                },
                dietary_filter: {
                  type: 'string',
                  enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free'],
                  description: 'Optional dietary filter'
                }
              }
            }
          },
          {
            type: 'function',
            name: 'check_allergens',
            description: 'Check if menu items contain specific allergens',
            parameters: {
              type: 'object',
              properties: {
                item_name: {
                  type: 'string',
                  description: 'Name of the menu item'
                },
                allergens: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'List of allergens to check: gluten, dairy, nuts, shellfish, eggs, fish'
                }
              },
              required: ['item_name', 'allergens']
            }
          },
          {
            type: 'function',
            name: 'create_order',
            description: 'Create a new food order for delivery or pickup',
            parameters: {
              type: 'object',
              properties: {
                customer_name: {
                  type: 'string',
                  description: 'Customer full name'
                },
                customer_phone: {
                  type: 'string',
                  description: 'Phone number in Malta format'
                },
                order_type: {
                  type: 'string',
                  enum: ['delivery', 'pickup'],
                  description: 'Whether delivery or pickup'
                },
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      item_name: { type: 'string' },
                      quantity: { type: 'number' },
                      modifications: { type: 'string' }
                    }
                  },
                  description: 'List of ordered items with quantities and modifications'
                },
                delivery_address: {
                  type: 'string',
                  description: 'Full delivery address if order_type is delivery'
                },
                delivery_city: {
                  type: 'string',
                  description: 'City for delivery'
                },
                delivery_postal_code: {
                  type: 'string',
                  description: 'Postal code for delivery'
                },
                special_instructions: {
                  type: 'string',
                  description: 'Any special instructions for the order'
                }
              },
              required: ['customer_name', 'customer_phone', 'order_type', 'items']
            }
          },
          {
            type: 'function',
            name: 'cancel_reservation',
            description: 'Cancel an existing reservation',
            parameters: {
              type: 'object',
              properties: {
                confirmation_code: {
                  type: 'string',
                  description: 'Reservation confirmation code'
                },
                customer_phone: {
                  type: 'string',
                  description: 'Phone number for verification'
                },
                reason: {
                  type: 'string',
                  description: 'Optional cancellation reason'
                }
              },
              required: ['confirmation_code', 'customer_phone']
            }
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      
      return res.status(response.status).json({
        error: 'Failed to create session with OpenAI',
        details: response.status === 401 ? 'Invalid API key' : 'Service temporarily unavailable',
        statusCode: response.status
      });
    }

    const data = await response.json();

    // Return ephemeral credentials to frontend
    return res.status(200).json({
      client_secret: data.client_secret.value,
      session_id: data.id,
      expires_at: data.client_secret.expires_at,
    });

  } catch (error) {
    console.error('Session creation error:', error);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Unable to create session',
      details: 'Please try again or contact support if the issue persists'
    });
  }
}
