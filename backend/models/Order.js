import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
 _id: { type: String }, // Explicitly set as String type
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  classIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
  orderDate: { type: Date, default: Date.now },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' },
  paymentDueDate: { type: Date },
});

export default mongoose.model('Order', OrderSchema);