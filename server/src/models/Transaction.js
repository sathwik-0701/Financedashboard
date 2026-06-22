const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true, maxlength: 100 },
    type: { type: String, required: true, enum: ['income', 'expense'] },
    date: { type: String, required: true }, // stored as 'YYYY-MM-DD' to match existing UI
  },
  { timestamps: true }
);

// Shape the JSON response to match what the existing React UI already expects
TransactionSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.user;
    return ret;
  },
});

module.exports = mongoose.model('Transaction', TransactionSchema);
