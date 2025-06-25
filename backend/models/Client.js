import mongoose from 'mongoose';

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String },
  dateOfBirth: { type: Date },
  registrationDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  notes: { type: String },
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }]
});

const Client = mongoose.model('Client', ClientSchema);
export default Client;