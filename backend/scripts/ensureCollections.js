require('dotenv').config();
const mongoose = require('mongoose');
const models = [
    require('../models/User'),
    require('../models/Course'),
    require('../models/Module'),
    require('../models/Enrollment'),
    require('../models/Submission')
];

async function ensureCollections() {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be configured');
    }

    await mongoose.connect(process.env.MONGO_URI);

    for (const model of models) {
        try {
            await model.createCollection();
        } catch (error) {
            if (error.code !== 48) {
                throw error;
            }
        }
        await model.createIndexes();
        console.log(`Ensured ${model.collection.collectionName} collection and indexes`);
    }
}

ensureCollections()
    .catch(error => {
        console.error('Failed to ensure MongoDB collections:', error.message);
        process.exitCode = 1;
    })
    .finally(async() => {
        await mongoose.disconnect();
    });
