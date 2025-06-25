import axios from 'axios';
import Client from '../models/Client.js';
import Order from '../models/Order.js';

class ExternalAPIService {
  async createClient(clientData) {
   
    const client = new Client(clientData);
    await client.save();
    return client;
  }

  async createOrder(orderData) {
   
    const client = await Client.findById(orderData.clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    
    const course = await Course.findById(orderData.courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    
    const order = new Order({
      ...orderData,
      amount: course.price
    });

    await order.save();
    
    
    client.orders.push(order._id);
    await client.save();

    return order;
  }
}

export default new ExternalAPIService();