const { MongoClient } = require('mongodb');
require('dotenv').config();

async function ingestData(textChunks) {
    const client = new MongoClient(process.env.MONGO_URI);
    try {
        await client.connect();
        const db = client.db('learning-management-system'); // Targeting your existing database
        const collection = db.collection('documents');

        // Dynamically import the ES Module
        const { pipeline } = await import('@xenova/transformers');
        const generateEmbedding = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

        for (const chunk of textChunks) {
            const output = await generateEmbedding(chunk, { pooling: 'mean', normalize: true });
            const embedding = Array.from(output.data);

            await collection.insertOne({
                text: chunk,
                embedding: embedding
            });
        }
        console.log("Data vectorized and saved successfully!");
    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
}

// Add your custom M-Pesa or business knowledge here
ingestData([
    "To integrate M-Pesa STK push, you need a Paybill number and an authentication token.",
    "The transaction fee for sending 1000 KES is 12 KES."
]);