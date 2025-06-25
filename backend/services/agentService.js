
import MongoDBTool from './mongoDBTool.js';
import ExternalAPIService from './externalAPIService.js';

class SupportAgentService {
  constructor() {
    
    this.tools = {
      mongoDBTool: MongoDBTool,
      externalAPIService: ExternalAPIService,
    };

  }

  async processQuery(query) {
    
    try {
      
      const intent = await this.determineIntent(query);
      
      
      switch(intent) {
        case 'client_search':
          return await this.handleClientSearch(query);
        case 'order_status':
          return await this.handleOrderStatus(query);
        case 'payment_info':
          return await this.handlePaymentInfo(query);
        case 'course_class_info':
          return await this.handleCourseClassInfo(query);
        case 'create_client':
          return await this.handleCreateClient(query);
        case 'create_order':
          return await this.handleCreateOrder(query);
        default:
          return await this.handleGeneralQuery(query);
      }
    } catch (error) {
      console.error("Error processing query:", error);
      return "I encountered an error while processing your request. Please try again.";
    }
  }

  determineIntent(query) {
    const lower = query.toLowerCase();
    if (lower.includes("create client") || lower.includes("new enquiry")) return "create_client";
    if (lower.includes("create order")) return "create_order";
    if (lower.includes("upcoming classes") || lower.includes("available") || lower.includes("schedule")) return "course_class_info";
    if (lower.includes("payment") || lower.includes("dues")) return "payment_info";
    if (lower.includes("order") && (lower.includes("status") || lower.includes("paid"))) return "order_status";
    if (lower.includes("client") || lower.includes("enrolled") || lower.includes("search")) return "client_search";
    return "general_query";
  }
  

  async handleClientSearch(query) {
    
    const searchParams = await this.extractClientSearchParams(query);
    
    
    const clients = await this.tools.mongoDBTool.findClient(searchParams);
    
    if (!clients || clients.length === 0) {
      return "No clients found matching your criteria.";
    }
    
    
    return this.formatClientResponse(clients);
  }

  async extractClientSearchParams(query) {
    const lower = query.toLowerCase();
    const params = {};
    if (lower.includes("email")) {
      const match = query.match(/email\s+([^\s]+)/i);
      if (match) params.email = match[1];
    }
    if (lower.includes("phone")) {
      const match = query.match(/phone\s+(\d{10})/);
      if (match) params.phone = match[1];
    }
    if (lower.includes("name")) {
      const match = query.match(/name\s+([a-z\s]+)/i);
      if (match) params.name = match[1].trim();
    }
    return params;
  }
  

  formatClientResponse(clients) {
    let response = "Here are the matching clients:\n\n";
    clients.forEach(client => {
      response += `Name: ${client.name}\n`;
      response += `Email: ${client.email}\n`;
      response += `Phone: ${client.phone}\n`;
      response += `Status: ${client.status}\n`;
      response += `Registered: ${client.registrationDate.toLocaleDateString()}\n\n`;
    });
    return response;
  }

  async handleOrderStatus(query) {
    
    const searchParams = await this.extractOrderSearchParams(query);
    
    
    const orders = await this.tools.mongoDBTool.findOrder(searchParams);
    
    if (!orders || orders.length === 0) {
      return "No orders found matching your criteria.";
    }
    
    
    return this.formatOrderResponse(orders);
  }

  async extractOrderSearchParams(query) {
    const lower = query.toLowerCase();
  const params = {};
  
  
  const orderIdMatch = query.match(/(?:order\s*#?|id\s*[:]?\s*)(\d+)/i);
  if (orderIdMatch) {
    params._id = orderIdMatch[1];
  }
  
    
    const clientIdMatch = query.match(/client\s+id\s+([a-f0-9]{6,24})/i);
    if (clientIdMatch) {
      params.clientId = clientIdMatch[1];
    }
  
    
    const statusMatch = lower.match(/\b(pending|paid|cancelled|completed|failed|processing)\b/);
    if (statusMatch) {
      params.status = statusMatch[1];
    }
  
    return params;
  }
  

  formatOrderResponse(orders) {
    let response = "Here are the matching orders:\n\n";
    orders.forEach(order => {
      response += `Order ID: ${order._id}\n`;
      response += `Client: ${order.clientId?.name || 'Unknown Client'}\n`;
response += `Course: ${order.courseId?.name || 'Unknown Course'}\n`;
      response += `Amount: $${order.amount}\n`;
      response += `Status: ${order.status}\n`;
      response += `Order Date: ${order.orderDate.toLocaleDateString()}\n\n`;
    });
    return response;
  }

  async handlePaymentInfo(query) {
    
    const orderId = await this.extractOrderId(query);
    if (!orderId) {
      return "Please specify an order ID to check payment information.";
    }
    
    
    const order = await this.tools.mongoDBTool.getOrderById(orderId);
    if (!order) {
      return `No order found with ID ${orderId}.`;
    }
    
    
    const payments = await this.tools.mongoDBTool.findPaymentsForOrder(orderId);
    
    
    const pendingAmount = await this.tools.mongoDBTool.calculatePendingAmount(orderId);
    
    
    return this.formatPaymentResponse(order, payments, pendingAmount);
  }

  async extractOrderId(query) {
    const match = query.match(/order\s+(id\s*)?#?([a-zA-Z0-9]{6,24})/i);
    return match ? match[2] : null;
  }
  
  formatPaymentResponse(order, payments, pendingAmount) {
    let response = `Payment Information for Order ${order._id}:\n\n`;
    response += `Client: ${order.clientId.name}\n`;
    response += `Course: ${order.courseId.name}\n`;
    response += `Total Amount: $${order.amount}\n\n`;
    
    if (payments.length > 0) {
      response += "Payment History:\n";
      payments.forEach(payment => {
        response += `- $${payment.amount} on ${payment.paymentDate.toLocaleDateString()} (${payment.paymentMethod}, ${payment.status})\n`;
      });
    } else {
      response += "No payments recorded for this order.\n";
    }
    
    response += `\nPending Amount: $${pendingAmount}\n`;
    response += `Payment Status: ${pendingAmount > 0 ? 'Pending' : 'Paid in full'}\n`;
    
    return response;
  }

  async handleCourseClassInfo(query) {
   
    if (query.toLowerCase().includes('upcoming') || query.toLowerCase().includes('this week')) {
      const classes = await this.tools.mongoDBTool.getUpcomingClasses();
      return this.formatClassResponse(classes);
    }
    
    
    const searchParams = await this.extractCourseClassSearchParams(query);
    const courses = await this.tools.mongoDBTool.findCourses(searchParams.course);
    const classes = await this.tools.mongoDBTool.findClasses(searchParams.class);
    
    return this.formatCombinedCourseClassResponse(courses, classes);
  }

  async extractCourseClassSearchParams(query) {
    const lower = query.toLowerCase();
    const course = {};
    const cls = {};
  
    
    const courseMatch = query.match(/(?:course|program|service)\s+(named\s+)?["']?([a-zA-Z\s]+)["']?/i);
    if (courseMatch) {
      course.name = courseMatch[2].trim();
    }
  
    
    const instructorMatch = query.match(/instructor\s+(named\s+)?["']?([a-zA-Z\s]+)["']?/i);
    if (instructorMatch) {
      cls.instructor = instructorMatch[2].trim();
    }
  
    
    const dayMatch = lower.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
    if (dayMatch) {
      cls.schedule = { day: dayMatch[1] };
    }
  
    
  
    return {
      course,
      class: cls,
    };
  }
  

  formatClassResponse(classes) {
    if (classes.length === 0) {
      return "No upcoming classes found.";
    }
    
    let response = "Upcoming Classes:\n\n";
    classes.forEach(cls => {
        response += `Course: ${cls.courseId?.name || 'N/A'}\n`;
      response += `Instructor: ${cls.instructor}\n`;
      response += `Start Date: ${cls.startDate.toLocaleDateString()}\n`;
      response += `Schedule: ${cls.schedule.map(s => `${s.day} ${s.startTime}-${s.endTime}`).join(', ')}\n`;
      response += `Status: ${cls.status}\n\n`;
    });
    return response;
  }

  formatCombinedCourseClassResponse(courses, classes) {
    let response = "";
    
    if (courses.length > 0) {
      response += "Matching Courses:\n\n";
      courses.forEach(course => {
        response += `Name: ${course.name}\n`;
        response += `Description: ${course.description}\n`;
        response += `Duration: ${course.duration} weeks\n`;
        response += `Price: $${course.price}\n`;
        response += `Level: ${course.level}\n\n`;
      });
    }
    
    if (classes.length > 0) {
      response += "Matching Classes:\n\n";
      classes.forEach(cls => {
        response += `Course: ${cls.courseId?.name || 'N/A'}\n`;
        response += `Instructor: ${cls.instructor}\n`;
        response += `Start Date: ${cls.startDate.toLocaleDateString()}\n`;
        response += `Schedule: ${cls.schedule.map(s => `${s.day} ${s.startTime}-${s.endTime}`).join(', ')}\n`;
        response += `Status: ${cls.status}\n\n`;
      });
    }
    
    if (courses.length === 0 && classes.length === 0) {
      response = "No matching courses or classes found.";
    }
    
    return response;
  }

  async handleCreateClient(query) {
    
    const clientData = await this.extractClientData(query);
    if (!clientData.name || !clientData.email || !clientData.phone) {
      return "I need at least name, email, and phone to create a new client.";
    }
    
    
    try {
      const newClient = await this.tools.externalAPIService.createClient(clientData);
      return `New client created successfully!\n\nClient ID: ${newClient._id}\nName: ${newClient.name}\nEmail: ${newClient.email}\nPhone: ${newClient.phone}`;
    } catch (error) {
      return `Error creating client: ${error.message}`;
    }
  }

  async extractClientData(query) {
    const clientData = {};
  
    
    const nameMatch = query.match(/\b(name is|i am|i'm|this is)\s+([a-zA-Z\s]+)(?=[.,]|$)/i);
    if (nameMatch) {
      clientData.name = nameMatch[2].trim();
    }
  
    
    const emailMatch = query.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/);
    if (emailMatch) {
      clientData.email = emailMatch[0].trim();
    }
  
    
    const phoneMatch = query.match(/(\+?\d{1,3}[\s-]?)?(\d{10})/);
    if (phoneMatch) {
      clientData.phone = phoneMatch[0].trim();
    }
  
    
    const addressMatch = query.match(/address is\s+([a-zA-Z0-9\s,.-]+)/i);
    if (addressMatch) {
      clientData.address = addressMatch[1].trim();
    }
  
    
    const dobMatch = query.match(/(?:dob|date of birth)\s*[:is]*\s*([\d\/-]+)/i);
    if (dobMatch) {
      clientData.dateOfBirth = dobMatch[1].trim();
    }
  
    return clientData;
  }
  

  async handleCreateOrder(query) {
    
    const { clientInfo, courseInfo } = await this.extractOrderData(query);
    if (!clientInfo || !courseInfo) {
      return "I need both client information and course/class information to create an order.";
    }
    
    
    const client = await this.tools.mongoDBTool.findClient(clientInfo);
    if (!client || client.length === 0) {
      return "Client not found. Please check the client information and try again.";
    }
    if (client.length > 1) {
      return "Multiple clients found. Please provide more specific client details.";
    }
    
    
    const course = await this.tools.mongoDBTool.findCourses({ name: new RegExp(courseInfo, 'i') });
    if (!course || course.length === 0) {
      return "Course not found. Please check the course name and try again.";
    }
    if (course.length > 1) {
      return "Multiple courses found. Please provide a more specific course name.";
    }
    
    
    try {
      const newOrder = await this.tools.externalAPIService.createOrder({
        clientId: client[0]._id,
        courseId: course[0]._id
      });
      
      return `New order created successfully!\n\nOrder ID: ${newOrder._id}\nClient: ${client[0].name}\nCourse: ${course[0].name}\nAmount: $${newOrder.amount}\nStatus: ${newOrder.status}`;
    } catch (error) {
      return `Error creating order: ${error.message}`;
    }
  }

  async extractOrderData(query) {
    const clientInfo = {};
    let courseInfo = null;
  
    
    const nameMatch = query.match(/\b(name is|for|client is|client name is)\s+([a-zA-Z\s]+)/i);
    if (nameMatch) {
      clientInfo.name = nameMatch[2].trim();
    }
  
    
    const emailMatch = query.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/);
    if (emailMatch) {
      clientInfo.email = emailMatch[0].trim();
    }
  
    
    const phoneMatch = query.match(/(\+?\d{1,3}[\s-]?)?(\d{10})/);
    if (phoneMatch) {
      clientInfo.phone = phoneMatch[0].trim();
    }
  
    
    const courseMatch = query.match(/(?:enroll(ed)?|register(ed)?|book(ed)?|order(ed)?|course is|for)\s+(?:in\s+)?([a-zA-Z\s]+ course|[a-zA-Z\s]+)/i);
    if (courseMatch) {
      courseInfo = courseMatch[2].replace(/ course$/i, '').trim();
    }
  
    return {
      clientInfo: Object.keys(clientInfo).length > 0 ? clientInfo : null,
      courseInfo: courseInfo || null
    };
  }
  

  async handleGeneralQuery(query) {
    const lowerQuery = query.toLowerCase();
  
    if (lowerQuery.includes("help") || lowerQuery.includes("how to")) {
      return `
  Here’s how I can assist you:
  1. Search clients by name/email/phone.
  2. Get order status using ID or client info.
  3. View payment history and pending dues.
  4. Find upcoming courses or classes.
  5. Create new client or place a course order.
  
  Just type your query, and I’ll try to help!
      `.trim();
    }
  
    if (lowerQuery.includes("thank")) {
      return "You're welcome! Let me know if there's anything else I can assist with.";
    }
  
    if (lowerQuery.includes("hi") || lowerQuery.includes("hello")) {
      return "Hello! I'm your support assistant. How can I help you today?";
    }
  
    if (lowerQuery.includes("services")) {
      return "We offer wellness services, fitness classes, and personal training sessions. Ask for upcoming classes to know more.";
    }
  
    return "I'm not sure how to help with that. Try rephrasing your query or ask for help.";
  }
  
}

export default new SupportAgentService();