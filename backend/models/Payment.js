import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
 orderId: { type: String, ref: 'Order' },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  paymentMethod: { type: String, enum: ['credit_card', 'bank_transfer', 'cash'], required: true },
  transactionId: { type: String },
  status: { type: String, enum: ['completed', 'failed', 'pending'], default: 'completed' },
});

export default mongoose.model('Payment', PaymentSchema);