const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User');
const { OpenAI } = require('openai'); // Added for OpenRouter
require('dotenv').config();

// Import your M-Pesa routes
const mpesaRoutes = require('./routes/mpesaRoutes'); 
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';
const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
const frontendOrigin = new URL(frontendUrl).origin;
const backendUrl = (process.env.BACKEND_URL || `http://localhost:${PORT}`).replace(/\/+$/, '');
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

// Middleware
app.use(cors({ origin: frontendOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', isProduction ? 1 : false);

const sessionSecret = process.env.SESSION_SECRET || process.env.JWT_SECRET;
if (!sessionSecret && isProduction) {
    throw new Error('SESSION_SECRET or JWT_SECRET must be configured in production');
}

app.use(session({
    secret: sessionSecret || 'local-development-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax',
        secure: isProduction,
        maxAge: 24 * 60 * 60 * 1000
    }
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
    User.findById(id).then(user => done(null, user)).catch(done);
});

if (googleClientId && googleClientSecret) {
    passport.use(new GoogleStrategy({
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || `${backendUrl}/auth/google/callback`
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value?.toLowerCase();
            if (!email || profile._json.email_verified !== true) {
                return done(null, false, { message: 'Google did not provide a verified email address' });
            }

            let user = await User.findOne({ googleId: profile.id });
            if (!user) {
                user = await User.findOne({ email });
                if (user && user.googleId && user.googleId !== profile.id) {
                    return done(null, false, { message: 'This email is already linked to another Google account' });
                }
            }

            if (!user) {
                user = new User({
                    googleId: profile.id,
                    email,
                    name: profile.displayName || 'New User',
                    profilePicture: profile.photos?.[0]?.value || '',
                    isVerified: true
                });
            } else {
                user.googleId = profile.id;
                user.isVerified = true;
                if (!user.profilePicture && profile.photos?.[0]?.value) {
                    user.profilePicture = profile.photos[0].value;
                }
            }

            await user.save();
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }));
}

// Dynamically import the ES Module for local embeddings
let generateEmbedding;
(async () => {
    const { pipeline } = await import('@xenova/transformers');
    generateEmbedding = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('AI Embedding Model loaded.');
})();

// Initialize OpenRouter
const openrouter = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
        'HTTP-Referer': 'http://localhost:5000',
        'X-OpenRouter-Title': 'MERN RAG Chatbot'
    }
});

// Register the M-Pesa API routes
app.use('/api/mpesa', mpesaRoutes);
app.use('/api/auth', authRoutes);

app.get('/auth/google', (req, res, next) => {
    if (!googleClientId || !googleClientSecret) {
        return res.status(503).send('Google sign-in is not configured on the server.');
    }
    return passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

app.get('/auth/google/callback', (req, res, next) => {
    if (!googleClientId || !googleClientSecret) {
        return res.status(503).send('Google sign-in is not configured on the server.');
    }
    return passport.authenticate('google', {
        failureRedirect: `${frontendOrigin}/auth/callback`
    })(req, res, next);
}, (req, res) => {
    res.redirect(`${frontendOrigin}/auth/callback`);
});

// AI RAG Chatbot Route
app.post('/api/chat', async (req, res) => {
    try {
        const { question } = req.body;
        if (!generateEmbedding) return res.status(503).json({ error: "AI model is still loading" });

        // 1. Embed the user's question
        const queryOutput = await generateEmbedding(question, { pooling: 'mean', normalize: true });
        const queryVector = Array.from(queryOutput.data);

        // 2. Perform Vector Search in MongoDB Atlas
        // mongoose.connection.db provides access to the raw MongoDB driver for aggregations
        const searchResults = await mongoose.connection.db.collection('documents').aggregate([
            {
                $vectorSearch: {
                    index: "vector_index", // Must match your Atlas Search Index name
                    path: "embedding",
                    queryVector: queryVector,
                    numCandidates: 10,
                    limit: 5
                }
            },
            { $project: { text: 1, _id: 0, score: { $meta: "vectorSearchScore" } } }
        ]).toArray();

        // 3. Construct the vector context payload
        const vectorContext = searchResults.map(doc => doc.text).join('\n\n');

        // 4. Fetch the latest live transaction from your M-Pesa collection
        const latestTransaction = await mongoose.connection.db.collection('transactions')
            .find()
            .sort({ _id: -1 }) // Sort by newest first
            .limit(1)
            .toArray();

        let liveContext = "";
        if (latestTransaction.length > 0) {
            const tx = latestTransaction[0];
            // Adjusted fields to match the amount and phoneNumber fields in your database
            liveContext = `Live Data: The most recent payment was ${tx.amount || 'an unknown amount'} KES from phone number ${tx.phoneNumber || 'unknown'}.`;
        }

        // 5. Combine both contexts
        const finalContext = `Knowledge Base:\n${vectorContext}\n\n${liveContext}`;

        // 6. Generate Answer via OpenRouter
        const completion = await openrouter.chat.completions.create({
            model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct',
            messages: [
                { 
                    role: 'system', 
                    content: `You are a helpful assistant. Use the following context to answer the user's question. If the answer is not in the context, say you don't know.\n\nContext:\n${finalContext}` 
                },
                { role: 'user', content: question }
            ]
        });

        res.json({ answer: completion.choices[0].message.content });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong with the AI chat." });
    }
});

// Test Route
app.get('/', (req, res) => {
    res.send('M-Pesa and AI Backend is running');
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected to mpesa database'))
    .catch(err => console.log(err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));