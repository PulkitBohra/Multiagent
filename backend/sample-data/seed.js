import mongoose from 'mongoose';
import Client from '../models/Client.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Course from '../models/Course.js';
import Class from '../models/Class.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const loadSampleData = async (file) => {
  const data = fs.readFileSync(path.join(__dirname, '../../sample-data', file));
  return JSON.parse(data);
};

export const seedDatabase = async () => {
  try {
    // Clear existing data
    await Client.deleteMany({});
    await Order.deleteMany({});
    await Payment.deleteMany({});
    await Course.deleteMany({});
    await Class.deleteMany({});

    // Load sample data
    const clientsData = await loadSampleData('clients.json');
    const coursesData = await loadSampleData('courses.json');
    const classesData = await loadSampleData('classes.json');
    const ordersData = await loadSampleData('orders.json');
    const paymentsData = await loadSampleData('payments.json');

    // Insert clients
    const clients = await Client.insertMany(clientsData);

    // Insert courses
    const courses = await Course.insertMany(coursesData);

    // Insert classes with course references
    const classes = await Promise.all(classesData.map(async (classData, index) => {
      // Alternate between courses for variety
      const courseIndex = index % courses.length;
      classData.courseId = courses[courseIndex]._id;
      return new Class(classData).save();
    }));

    // Insert orders with references
    const orders = await Promise.all(ordersData.map(async (orderData, index) => {
      // Alternate between clients and courses
      const clientIndex = index % clients.length;
      const courseIndex = index % courses.length;
      
      orderData.clientId = clients[clientIndex]._id;
      orderData.courseId = courses[courseIndex]._id;
      
      // Add some classes to the order
      if (classes.length > 0) {
        orderData.classIds = [classes[index % classes.length]._id];
      }
      
      return new Order(orderData).save();
    }));

    // Insert payments with order references
    await Promise.all(paymentsData.map(async (paymentData, index) => {
      if (index < orders.length) {
        paymentData.orderId = orders[index]._id;
        await new Payment(paymentData).save();
      }
    }));

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};