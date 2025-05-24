import * as dotenv from 'dotenv';
import axios from 'axios';
import { getLogger } from '../../src/utils/logger';

dotenv.config();
const logger = getLogger('HuggingFaceSetupTest');

/**
 * HuggingFace Testing Infrastructure Setup
 */
describe('HuggingFace Testing Infrastructure', () => {
  const EMBEDDING_MODELS = [
    'BAAI/bge-base-en-v1.5',      // Primary model (768 dim)
    'BAAI/bge-small-en-v1.5',     // Fallback model (384 dim)
    'sentence-transformers/all-MiniLM-L12-v2', // Alternative (384 dim)
    'microsoft/codebert-base'      // Code-specific model (768 dim)
  ];

  const TEST_CODE_SAMPLES = [
    'function authenticateUser(token) { return validateToken(token); }',
    'async function processData(input) { return input.map(transform).filter(validate); }',
    'class UserService { constructor(db) { this.db = db; } async findUser(id) { return this.db.find(id); } }',
    'const handleError = (error) => { console.error(error); throw new Error("Processing failed"); }',
    'export default function Component({ user }) { return <div>{user.name}</div>; }'
  ];

  beforeAll(() => {
    if (!process.env.HUGGINGFACE_TOKEN) {
      throw new Error('HUGGINGFACE_TOKEN environment variable is required');
    }
    logger.info('🔧 Setting up HuggingFace testing infrastructure...');
  });

  describe('API Authentication and Connectivity', () => {
    it('should validate API token', async () => {
      const response = await axios.get('https://huggingface.co/api/whoami', {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_TOKEN}`
        }
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('name');
      logger.info(`✅ Authenticated as: ${response.data.name}`);
    }, 10000);

    it('should test rate limiting and error handling', async () => {
      const invalidToken = 'invalid-token-12345';
      
      try {
        await axios.post(
          'https://api-inference.huggingface.co/models/BAAI/bge-base-en-v1.5',
          { inputs: 'test' },
          {
            headers: {
              'Authorization': `Bearer ${invalidToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        fail('Should have thrown an error with invalid token');
      } catch (error) {
        expect(axios.isAxiosError(error)).toBe(true);
        if (axios.isAxiosError(error)) {
          expect(error.response?.status).toBe(401);
        }
        logger.info('✅ Error handling for invalid token works correctly');
      }
    }, 10000);
  });
});
