import Client from '../models/Client.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Course from '../models/Course.js';
import Class from '../models/Class.js';

class MongoDBTool {
  
  async findClient(query) {
    return Client.find(query).populate({
      path: 'orders',
      populate: { path: 'courseId classIds' }
    });
  }

  async getClientById(id) {
    return Client.findById(id).populate({
      path: 'orders',
      populate: { path: 'courseId classIds' }
    });
  }

  
  async findOrder(query) {
    console.log('Searching for order with query:', query); 
    const results = await Order.find(query).populate('clientId courseId classIds');
    console.log('Found orders:', results);
    return results.filter(order => order.clientId && order.courseId);
  }
  
  async getOrderById(id) {
    return Order.findById(id).populate('clientId courseId classIds');
  }

  
  async findPaymentsForOrder(orderId) {
    return Payment.find({ orderId });
  }

  async calculatePendingAmount(orderId) {
    const order = await Order.findById(orderId);
    if (!order) return 0;
    
    const payments = await Payment.find({ orderId });
    const paidAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    return order.amount - paidAmount;
  }

  
  async findCourses(query) {
    return Course.find(query);
  }

  
  async findClasses(query) {
    return Class.find(query).populate('courseId');
  }

  async getUpcomingClasses() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endOfNextWeek = new Date();
    endOfNextWeek.setDate(today.getDate() + 14); 
    endOfNextWeek.setHours(23, 59, 59, 999);
  
    return Class.find({ 
      startDate: { 
        $gte: today, 
        $lte: endOfNextWeek 
      },
      status: { $in: ['upcoming', 'ongoing'] }
    }).populate('courseId');
  }
  
}

export default new MongoDBTool();