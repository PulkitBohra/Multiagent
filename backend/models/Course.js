import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  name: { type: String, required: true },
  description: { type: String },
  duration: { type: Number }, // in weeks
  price: { type: Number, required: true },
  category: { type: String },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  isActive: { type: Boolean, default: true },
});

export default mongoose.model('Course', CourseSchema);