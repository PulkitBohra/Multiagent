import mongoose from 'mongoose';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { connectDB } from './config/db.js';
import agentRoutes from './routes/agentRoutes.js';
import { seedDatabase } from './sample-data/seed.js';
import Course from './models/Course.js';
import Class from './models/Class.js';
import Client from './models/Client.js';
import Order from './models/Order.js';
import Payment from './models/Payment.js';
const app = express();


app.use(bodyParser.json());
app.use(cors());


connectDB();

const manualSeed = async () => {
    try {
      
      await Promise.all([
        Course.deleteMany({}),
        Class.deleteMany({}),
        Client.deleteMany({}),
        Order.deleteMany({}),
        Payment.deleteMany({}),
      ]);
  
      
      const yogaId = new mongoose.Types.ObjectId("666a9e0a0f0a5e1a1a1a1001");
      const pilatesId = new mongoose.Types.ObjectId("666a9e0a0f0a5e1a1a1a1002");
  
      const priyaId = new mongoose.Types.ObjectId("666a9e0a0f0a5e1a1a1a2001");
      const rajId = new mongoose.Types.ObjectId("666a9e0a0f0a5e1a1a1a2002");
  
      const class1Id = new mongoose.Types.ObjectId("666a9e0a0f0a5e1a1a1a3001");
      const class2Id = new mongoose.Types.ObjectId("666a9e0a0f0a5e1a1a1a3002");
  
      const order1Id = "12346"
      const order2Id = "67890";

      const today = new Date();
const currentDay = today.getDay();
const nextMonday = new Date(today);
nextMonday.setDate(today.getDate() + ((1 - currentDay + 7) % 7));

const nextWednesday = new Date(today);
nextWednesday.setDate(today.getDate() + ((3 - currentDay + 7) % 7)); 
  
      
      await Course.insertMany([
        {
            _id: yogaId,  
          name: "Yoga Beginner",
          description: "Basic yoga poses",
          duration: 8,
          price: 200,
          category: "Yoga",
          level: "beginner",
          isActive: true
        },
        {
            _id: pilatesId,
          name: "Advanced Pilates",
          description: "Pilates core training",
          duration: 6,
          price: 250,
          category: "Pilates",
          level: "advanced",
          isActive: true
        }
      ]);
  
      
      await Client.insertMany([
        {
          name: "Priya Sharma",
          email: "priya.sharma@example.com",
          phone: "+1234567890",
          address: "123 Yoga St, Mumbai",
          status: "active",
          registrationDate: new Date("2023-01-15")
        },
        {
          name: "Raj Patel",
          email: "raj.patel@example.com",
          phone: "+1987654321",
          address: "456 Meditation Ave, Delhi",
          status: "active",
          registrationDate: new Date("2023-02-20")
        }
      ]);
  
      
      await Class.insertMany([
        {
          _id: class1Id,
          courseId: yogaId,
          instructor: "Deepak Chopra",
          startDate: nextMonday,
          endDate: new Date(nextMonday.getTime() + 1000 * 60 * 60 * 24 * 28),
          schedule: [
            { day: "Monday", startTime: "09:00", endTime: "10:00" },
            { day: "Wednesday", startTime: "09:00", endTime: "10:00" }
          ],
          maxCapacity: 15,
          currentEnrollment: 0,
          status: "upcoming",
          location: "Studio A"
        },
        {
          _id: class2Id,
          courseId: pilatesId,
          instructor: "Sara Ali",
          startDate: nextWednesday,
          endDate: new Date(nextWednesday.getTime() + 1000 * 60 * 60 * 24 * 28),
          schedule: [
            { day: "Wednesday", startTime: "11:00", endTime: "12:30" }
          ],
          maxCapacity: 10,
          currentEnrollment: 0,
          status: "upcoming",
          location: "Studio B"
        }
      ]);
  
      
      await Order.insertMany([
  {
    _id: order1Id,
    clientId: priyaId,
    courseId: yogaId,
    classIds: [class1Id],
    orderDate: new Date("2023-10-15"),
    amount: 200,
    status: "paid",
    paymentDueDate: new Date("2023-10-30")
  },
  {
    _id: order2Id,
    clientId: rajId,
    courseId: pilatesId,
    classIds: [class2Id],
    orderDate: new Date("2023-10-20"),
    amount: 250,
    status: "pending",
    paymentDueDate: new Date("2023-11-05")
  },
  {
    _id: "12345",
    clientId:rajId ,
    courseId: pilatesId,
    classIds: [class2Id],
    orderDate: new Date(),
    amount: 200,
    status: "paid",
  }
]);

  
      
      await Payment.insertMany([
        {
          orderId:order1Id,
          amount: 200,
          paymentDate: new Date("2023-10-16"),
          paymentMethod: "credit_card",
          transactionId: "PAY123456",
          status: "completed"
        },
        {
          orderId: order2Id,
          amount: 100,
          paymentDate: new Date("2023-10-25"),
          paymentMethod: "bank_transfer",
          transactionId: "PAY654321",
          status: "completed"
        }
      ]);

      
  
      console.log("✅ Sample data inserted successfully.");
    } catch (error) {
      console.error("❌ Error inserting sample data:", error);
    }
  };


app.use('/api/agent', agentRoutes);


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});


manualSeed();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});