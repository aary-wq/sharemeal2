const router = require('express').Router');
const { OpenAI } = require('openai');
const rateLimit = require('express-rate-limit');

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50 // limit each IP to 50 requests per windowMs
});

// Enhanced system message for donation and disaster relief
const systemMessage = {
    role: "system",
    content: `You are ShareMeal's AI assistant, specializing in food donations and disaster relief coordination. Help users with:

1. Food Donation Guidance:
   - Food safety guidelines
   - Acceptable food items
   - Packaging requirements
   - Pickup/delivery options

2. Disaster Relief Support:
   - Current relief efforts
   - Emergency food needs
   - Volunteer opportunities
   - NGO coordination

3. General Platform Help:
   - Donation tracking
   - NGO partnerships
   - Impact reporting
   - Tax receipts

Be concise, empathetic, and action-oriented. For emergencies, prioritize immediate assistance options.`
};

// Knowledge base for quick responses
const quickResponses = {
    food_safety: {
        guidelines: [
            "Package food in sealed containers",
            "Ensure proper temperature control",
            "Check expiration dates",
            "Avoid opened packages"
        ],
        prohibited: [
            "Homemade foods without proper certification",
            "Expired items",
            "Damaged packaging",
            "Temperature-abused items"
        ]
    },
    disaster_relief: {
        priorities: [
            "Non-perishable food items",
            "Clean drinking water",
            "Medical supplies",
            "Hygiene products"
        ],
        coordination: [
            "Contact local NGO partners",
            "Register as volunteer",
            "Coordinate pickup/delivery",
            "Track relief efforts"
        ]
    }
};

router.post('/message', limiter, async (req, res) => {
    try {
        const { message, language = 'en' } = req.body;

        // Check for quick responses
        const quickResponse = getQuickResponse(message);
        if (quickResponse) {
            return res.json({
                response: quickResponse,
                type: 'quick_response'
            });
        }

        // Get real-time disaster relief info
        const reliefInfo = await getReliefInfo(message);
        
        // Enhance prompt with context
        const enhancedMessage = `
            Context: ${reliefInfo ? `Current relief efforts: ${reliefInfo}` : ''}
            User message: ${message}
        `;

        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
            messages: [
                systemMessage,
                { role: "user", content: enhancedMessage }
            ],
            max_tokens: 150,
            temperature: 0.7
        });

        // Format response based on language
        const response = await translateResponse(
            completion.choices[0].message.content,
            language
        );

        res.json({ 
            response,
            type: 'ai_response',
            context: reliefInfo ? { reliefInfo } : null
        });
    } catch (error) {
        console.error('Chatbot API Error:', error);
        res.status(500).json({ 
            error: 'Failed to get response from AI',
            type: 'error'
        });
    }
});

function getQuickResponse(message) {
    // Check message against quick response patterns
    const patterns = {
        food_safety: /food safety|guidelines|requirements/i,
        donation_process: /how.*(donate|give|help)/i,
        emergency: /emergency|disaster|urgent/i
    };

    for (const [type, pattern] of Object.entries(patterns)) {
        if (pattern.test(message)) {
            return formatQuickResponse(type);
        }
    }
    return null;
}

async function getReliefInfo(message) {
    // Get real-time disaster relief information
    // This would connect to your disaster relief service
    return null; // Implement based on your needs
}

async function translateResponse(response, targetLanguage) {
    if (targetLanguage === 'en') return response;
    
    // Implement translation logic here
    // You could use Google Cloud Translation API or similar
    return response;
}

module.exports = router; 