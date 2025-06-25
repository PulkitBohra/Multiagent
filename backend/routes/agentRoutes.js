import express from 'express';
import { processQuery } from '../controllers/agentController.js';

const router = express.Router();

router.post('/query', processQuery);

export default router;