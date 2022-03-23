import mongoose from 'mongoose';

const QueueSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        get: v => v.toString().padStart(4, '0'),
    },
    headCount: {
        type: Number,
        required: true,
    }
}, {
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
});

module.exports = mongoose.models.Queue || mongoose.model('Queue', QueueSchema)