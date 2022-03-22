import mongoose from 'mongoose';

const ChairSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        alias: 'name'
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

ChairSchema.virtual('name').get(function() {
    return  'C' + this.id;
  });

module.exports = mongoose.models.Chair || mongoose.model('Chair', ChairSchema)