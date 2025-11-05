import { Note, Link, Space } from './types';

export const INITIAL_SPACES: Space[] = [
  { id: 'space-1', name: 'Product Management', color: '#34D399' },
  { id: 'space-2', name: 'Artificial Intelligence', color: '#60A5FA' },
  { id: 'space-3', name: 'General', color: '#A78BFA' },
];

export const INITIAL_NOTES: Note[] = [
  {
    id: '1',
    title: 'Product Management Methodologies',
    content: JSON.stringify({
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [{
          type: 'text',
          text: 'Product management involves various frameworks like Agile, Scrum, Kanban, and Waterfall. Agile focuses on iterative development and customer feedback. It is crucial for modern software development.',
        }],
      }],
    }),
    spaceId: 'space-1',
  },
  {
    id: '2',
    title: 'AI Product Management',
    content: JSON.stringify({
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [{
          type: 'text',
          text: 'Managing AI products is different from traditional software. It involves dealing with uncertainty in model performance, data dependencies, and ethical considerations. Key challenges include data sourcing, model validation, and explaining model behavior.',
        }],
      }],
    }),
    spaceId: 'space-1',
  },
  {
    id: '3',
    title: 'LLM Business Models',
    content: JSON.stringify({
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [{
          type: 'text',
          text: 'Large Language Models (LLMs) are enabling new business models. These include API-as-a-service (like OpenAI), specialized fine-tuned models for specific industries, and open-source models that companies can host themselves. Monetization can be based on usage, subscription, or value-add services.',
        }],
      }],
    }),
    spaceId: 'space-2',
  },
];

export const INITIAL_LINKS: Link[] = [
  { source: '1', target: '2', reason: 'AI Product Management is a specialized subset of general Product Management methodologies.' },
];
