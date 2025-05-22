import * as crypto from 'crypto';
import * as sodium from 'libsodium-wrappers';
// Use proper import syntax for Octokit with types
import { Octokit } from '@octokit/rest';
import type { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods';
import { getLogger } from '../utils/logger';

const logger = getLogger('SecretsManager');

/**
 * Secret configuration
 */
export interface SecretConfig {
  name: string;
  value: string;
  description: string;
  required?: boolean;
}

/**
 * Secret operation result
 */
export interface SecretOperationResult {
  success: boolean;
  secretName: string;
  error?: string;
}

/**
 * Secret operation summary
 */
export interface SecretsOperationSummary {
  total: number;
  successful: number;
  failed: number;
  results: SecretOperationResult[];
}

/**
 * Class to manage GitHub repository secrets for Remcode
 */
export class SecretsManager {
  private octokit: Octokit | null = null;
  private token: string | null = null;

  /**
   * Constructor
   * @param githubToken GitHub API token
   */
  constructor(githubToken?: string) {
    this.token = githubToken || process.env.GITHUB_TOKEN || null;
    
    if (this.token) {
      this.octokit = new Octokit({ auth: this.token });
      logger.debug('GitHub API client initialized');
    } else {
      logger.warn('No GitHub token provided, API operations will be simulated');
    }
  }

  /**
   * Configure required repository secrets
   * @param owner Repository owner
   * @param repo Repository name
   * @returns Summary of secret operations
   */
  async configureRepositorySecrets(owner: string, repo: string): Promise<SecretsOperationSummary> {
    logger.info(`Configuring repository secrets for ${owner}/${repo}`);
    
    const secrets = this.getRequiredSecrets();
    const results: SecretOperationResult[] = [];
    
    for (const secret of secrets) {
      try {
        const result = await this.setRepositorySecret(owner, repo, secret);
        results.push(result);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Failed to set secret ${secret.name}: ${errorMessage}`);
        
        results.push({
          success: false,
          secretName: secret.name,
          error: errorMessage
        });
        
        // If this is a required secret, we should abort
        if (secret.required) {
          throw new Error(`Failed to set required secret ${secret.name}: ${errorMessage}`);
        }
      }
    }
    
    // Calculate summary
    const successful = results.filter(r => r.success).length;
    const summary: SecretsOperationSummary = {
      total: secrets.length,
      successful,
      failed: secrets.length - successful,
      results
    };
    
    logger.info(`Secret configuration complete: ${successful}/${secrets.length} secrets configured`);
    return summary;
  }

  /**
   * Get required secrets for Remcode
   * @returns List of required secrets
   */
  private getRequiredSecrets(): SecretConfig[] {
    return [
      {
        name: 'PINECONE_API_KEY',
        value: process.env.PINECONE_API_KEY || '',
        description: 'Pinecone API key for vector storage',
        required: true
      },
      {
        name: 'HUGGINGFACE_TOKEN',
        value: process.env.HUGGINGFACE_TOKEN || '',
        description: 'HuggingFace token for embeddings',
        required: true
      },
      {
        name: 'OPENAI_API_KEY',
        value: process.env.OPENAI_API_KEY || '',
        description: 'OpenAI API key for advanced text processing',
        required: false
      },
      {
        name: 'SLACK_WEBHOOK_URL',
        value: process.env.SLACK_WEBHOOK_URL || '',
        description: 'Slack webhook URL for notifications',
        required: false
      }
    ];
  }

  /**
   * Set a repository secret in GitHub
   * @param owner Repository owner
   * @param repo Repository name
   * @param secret Secret configuration
   * @returns Secret operation result
   */
  private async setRepositorySecret(
    owner: string, 
    repo: string, 
    secret: SecretConfig
  ): Promise<SecretOperationResult> {
    logger.info(`Setting repository secret: ${secret.name}`);
    
    // Validate secret value
    if (!secret.value) {
      if (secret.required) {
        throw new Error(`Missing value for required secret: ${secret.name}`);
      } else {
        logger.warn(`Missing value for optional secret: ${secret.name}, skipping`);
        return {
          success: false,
          secretName: secret.name,
          error: 'Missing value for optional secret'
        };
      }
    }
    
    try {
      if (!this.octokit) {
        // Simulate API call if no GitHub token is available
        logger.info(`[SIMULATED] Secret ${secret.name} would be set for ${owner}/${repo}`);
        return {
          success: true,
          secretName: secret.name
        };
      }
      
      // Get the repository's public key for secret encryption
      const { data: publicKeyData } = await this.octokit.actions.getRepoPublicKey({
        owner,
        repo
      }) as RestEndpointMethodTypes['actions']['getRepoPublicKey']['response'];
      
      // Encrypt the secret value with the repository's public key
      const encryptedValue = await this.encryptSecret(
        publicKeyData.key,
        secret.value
      );
      
      // Create or update the secret
      await this.octokit.actions.createOrUpdateRepoSecret({
        owner,
        repo,
        secret_name: secret.name,
        encrypted_value: encryptedValue,
        key_id: publicKeyData.key_id
      });
      
      logger.info(`Secret ${secret.name} successfully set for ${owner}/${repo}`);
      
      return {
        success: true,
        secretName: secret.name
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to set secret ${secret.name}: ${errorMessage}`);
      
      return {
        success: false,
        secretName: secret.name,
        error: errorMessage
      };
    }
  }

  /**
   * Encrypt a secret value using sodium for GitHub
   * @param publicKey Base64-encoded public key
   * @param secretValue Secret value to encrypt
   * @returns Base64-encoded encrypted secret
   */
  private async encryptSecret(publicKey: string, secretValue: string): Promise<string> {
    // Wait for sodium to initialize
    await sodium.ready;
    
    // Convert the public key to a Uint8Array
    const publicKeyBytes = sodium.from_base64(
      publicKey,
      sodium.base64_variants.ORIGINAL
    );
    
    // Convert the secret to a Uint8Array
    const secretBytes = sodium.from_string(secretValue);
    
    // Encrypt the secret using libsodium
    const encryptedBytes = sodium.crypto_box_seal(secretBytes, publicKeyBytes);
    
    // Convert the encrypted secret to Base64
    return sodium.to_base64(encryptedBytes, sodium.base64_variants.ORIGINAL);
  }
  
  /**
   * Check if a repository has a specific secret
   * @param owner Repository owner
   * @param repo Repository name
   * @param secretName Secret name to check
   * @returns True if the secret exists
   */
  async hasRepositorySecret(owner: string, repo: string, secretName: string): Promise<boolean> {
    try {
      if (!this.octokit) {
        // Simulate API call if no GitHub token is available
        logger.info(`[SIMULATED] Checking if secret ${secretName} exists for ${owner}/${repo}`);
        return false;
      }
      
      // Get the list of repository secrets
      const { data } = await this.octokit.actions.listRepoSecrets({
        owner,
        repo
      }) as RestEndpointMethodTypes['actions']['listRepoSecrets']['response'];
      
      // Check if the secret exists
      return data.secrets.some((s: { name: string }) => s.name === secretName);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to check if secret ${secretName} exists: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Delete a repository secret
   * @param owner Repository owner
   * @param repo Repository name
   * @param secretName Secret name to delete
   * @returns True if the secret was deleted
   */
  async deleteRepositorySecret(owner: string, repo: string, secretName: string): Promise<boolean> {
    try {
      if (!this.octokit) {
        // Simulate API call if no GitHub token is available
        logger.info(`[SIMULATED] Deleting secret ${secretName} from ${owner}/${repo}`);
        return true;
      }
      
      // Delete the secret
      await this.octokit.actions.deleteRepoSecret({
        owner,
        repo,
        secret_name: secretName
      });
      
      logger.info(`Secret ${secretName} successfully deleted from ${owner}/${repo}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to delete secret ${secretName}: ${errorMessage}`);
      return false;
    }
  }
}
