import mongoose from 'mongoose';
import Chair from './chair';

let ObjectId = mongoose.SchemaTypes.ObjectId;

mongoose.set('toJSON', { virtuals: true });

const TableSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        alias: 'name'
    },
    chairs: [{
        type: ObjectId,
        ref: Chair
    }],
    status: {
        type: Boolean,
        default: false,
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

TableSchema.virtual('name').get(function() {
    return  'T' + this.id;
  });

module.exports = mongoose.models.Table || mongoose.model('Table', TableSchema);