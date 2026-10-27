const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { OpenAI } = require('openai'); // Added for OpenRouter
require('dotenv').config();

// Import your M-Pesa routes
const mpesaRoutes = require('./routes/mpesaRoutes'); 

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));