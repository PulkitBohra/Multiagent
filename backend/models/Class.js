import mongoose from 'mongoose';

const ClassSchema = new mongoose.Schema({
_id: { type: mongoose.Schema.Types.ObjectId, required: true }, 
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  instructor: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  schedule: [{
    day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
    startTime: { type: String },
    endTime: { type: String },
  }],
  maxCapacity: { type: Number },
  currentEnrollment: { type: Number, default: 0 },
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
  location: { type: String },
});

export default mongoose.model('Class', ClassSchema);