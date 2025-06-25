import SupportAgentService from '../services/agentService.js';

const processQuery = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const response = await SupportAgentService.processQuery(query);
    res.json({ response });
  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export { processQuery };