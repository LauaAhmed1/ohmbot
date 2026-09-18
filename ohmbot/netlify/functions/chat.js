import { createChatHandler } from '../../lib/chat-service.js';

export default createChatHandler();

// Beide erreichbaren Pfade begrenzen; das Frontend nutzt ausschließlich /api/chat.
export const config = {
  path: ['/api/chat', '/.netlify/functions/chat'],
  rateLimit: { windowLimit: 12, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
