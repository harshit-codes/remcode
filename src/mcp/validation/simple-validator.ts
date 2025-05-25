/**
 * Simple One-Shot Permission Validator
 * Validates GitHub, HuggingFace, and Pinecone permissions before MCP operations
 */

import { getLogger } from '../../utils/logger';

const logger = getLogger('SimpleValidator');

export interface ValidationStatus {
  valid: boolean;
  service: string;
  error?: string;
  fixUrl?: string;
}

export interface QuickValidation {
  allValid: boolean;
  github: ValidationStatus;
  huggingface: ValidationStatus;
  pinecone: ValidationStatus;
  message: string;
  setupUrls?: {
    github: string;
    huggingface: string;
    pinecone: string;
  };
}

export class SimpleValidator {
  /**
   * Quick validation of all required services
   */
  static async validateQuick(): Promise<QuickValidation> {
    logger.info('🔍 Quick permission validation...');

    const github = this.checkGitHubToken();
    const huggingface = this.checkHuggingFaceToken();
    const pinecone = this.checkPineconeToken();

    const allValid = github.valid && huggingface.valid && pinecone.valid;

    return {
      allValid,
      github,
      huggingface,
      pinecone,
      message: allValid 
        ? '✅ All tokens found and basic validation passed'
        : '❌ Missing or invalid tokens detected',
      setupUrls: allValid ? undefined : {
        github: 'https://github.com/settings/tokens/new?scopes=repo,workflow,write:repo_hook&description=Remcode%20MCP%20Tools',
        huggingface: 'https://huggingface.co/settings/tokens',
        pinecone: 'https://app.pinecone.io/organizations/-/projects/-/keys'
      }
    };
  }

  private static checkGitHubToken(): ValidationStatus {
    const token = process.env.GITHUB_TOKEN;
    
    if (!token) {
      return {
        valid: false,
        service: 'github',
        error: 'GITHUB_TOKEN environment variable not found',
        fixUrl: 'https://github.com/settings/tokens/new?scopes=repo,workflow,write:repo_hook&description=Remcode%20MCP%20Tools'
      };
    }

    if (token.length < 20) {
      return {
        valid: false,
        service: 'github',
        error: 'GitHub token appears to be invalid (too short)',
        fixUrl: 'https://github.com/settings/tokens/new?scopes=repo,workflow,write:repo_hook&description=Remcode%20MCP%20Tools'
      };
    }

    return {
      valid: true,
      service: 'github'
    };
  }

  private static checkHuggingFaceToken(): ValidationStatus {
    const token = process.env.HUGGINGFACE_TOKEN;
    
    if (!token) {
      return {
        valid: false,
        service: 'huggingface',
        error: 'HUGGINGFACE_TOKEN environment variable not found',
        fixUrl: 'https://huggingface.co/settings/tokens'
      };
    }

    if (!token.startsWith('hf_')) {
      return {
        valid: false,
        service: 'huggingface',
        error: 'HuggingFace token should start with "hf_"',
        fixUrl: 'https://huggingface.co/settings/tokens'
      };
    }

    return {
      valid: true,
      service: 'huggingface'
    };
  }

  private static checkPineconeToken(): ValidationStatus {
    const apiKey = process.env.PINECONE_API_KEY;
    
    if (!apiKey) {
      return {
        valid: false,
        service: 'pinecone',
        error: 'PINECONE_API_KEY environment variable not found',
        fixUrl: 'https://app.pinecone.io/organizations/-/projects/-/keys'
      };
    }

    if (apiKey.length < 20) {
      return {
        valid: false,
        service: 'pinecone',
        error: 'Pinecone API key appears to be invalid (too short)',
        fixUrl: 'https://app.pinecone.io/organizations/-/projects/-/keys'
      };
    }

    return {
      valid: true,
      service: 'pinecone'
    };
  }
}
