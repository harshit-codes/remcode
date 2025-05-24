/**
 * Token Management Utilities
 * 
 * Handles collection, validation, and storage of API tokens for remcode MCP server
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { getLogger } from './logger';
import chalk from 'chalk';

const logger = getLogger('TokenManager');

export interface TokenConfig {
  GITHUB_TOKEN?: string;
  PINECONE_API_KEY?: string;
  HUGGINGFACE_TOKEN?: string;
  [key: string]: string | undefined;
}

export interface TokenValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Token Manager class for handling API tokens
 */
export class TokenManager {
  private envFilePath: string;
  private gitignorePath: string;

  constructor(projectRoot?: string) {
    const root = projectRoot || process.cwd();
    this.envFilePath = path.join(root, '.env');
    this.gitignorePath = path.join(root, '.gitignore');
  }

  /**
   * Load existing tokens from .env file
   */
  loadExistingTokens(): TokenConfig {
    try {
      if (!fs.existsSync(this.envFilePath)) {
        logger.info('No existing .env file found');
        return {};
      }

      const envContent = fs.readFileSync(this.envFilePath, 'utf8');
      const tokens: TokenConfig = {};
      
      envContent.split('\n').forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, ...valueParts] = trimmedLine.split('=');
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim();
            if (this.isTokenKey(key.trim())) {
              tokens[key.trim()] = value;
            }
          }
        }
      });

      logger.info(`Loaded existing tokens: ${Object.keys(tokens).join(', ')}`);
      return tokens;
    } catch (error) {
      logger.warn(`Failed to load existing tokens: ${error instanceof Error ? error.message : String(error)}`);
      return {};
    }
  }

  /**
   * Collect missing tokens interactively from user
   */
  async collectMissingTokens(existingTokens: TokenConfig, cliTokens: TokenConfig): Promise<TokenConfig> {
    const requiredTokens = {
      GITHUB_TOKEN: 'GitHub Personal Access Token (for repository access)',
      PINECONE_API_KEY: 'Pinecone API Key (for vector operations)', 
      HUGGINGFACE_TOKEN: 'HuggingFace Token (for embedding generation)'
    };

    const finalTokens: TokenConfig = { ...existingTokens };
    const missingTokens: string[] = [];

    // Check which tokens are missing
    for (const [key, description] of Object.entries(requiredTokens)) {
      if (cliTokens[key]) {
        finalTokens[key] = cliTokens[key];
        console.log(chalk.green(`✓ ${key}: Provided via CLI argument`));
      } else if (existingTokens[key]) {
        finalTokens[key] = existingTokens[key];
        console.log(chalk.green(`✓ ${key}: Found in .env file`));
      } else {
        missingTokens.push(key);
      }
    }

    // If no tokens are missing, return
    if (missingTokens.length === 0) {
      console.log(chalk.green('\n🎉 All required tokens are available!'));
      return finalTokens;
    }

    console.log(chalk.yellow(`\n🔑 Missing ${missingTokens.length} required token(s). Let's collect them:`));
    console.log(chalk.gray('(You can skip tokens by pressing Enter, but functionality will be limited)\n'));

    // Collect missing tokens interactively
    for (const tokenKey of missingTokens) {
      const description = requiredTokens[tokenKey as keyof typeof requiredTokens];
      const token = await this.promptForToken(tokenKey, description);
      if (token && token.trim()) {
        finalTokens[tokenKey] = token.trim();
        console.log(chalk.green(`✓ ${tokenKey}: Collected successfully\n`));
      } else {
        console.log(chalk.yellow(`⚠ ${tokenKey}: Skipped (functionality will be limited)\n`));
      }
    }

    return finalTokens;
  }

  /**
   * Prompt user for a specific token
   */
  private async promptForToken(tokenKey: string, description: string): Promise<string> {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      console.log(chalk.cyan(`📝 ${tokenKey}:`));
      console.log(chalk.gray(`   ${description}`));
      console.log(chalk.gray(`   Get it from: ${this.getTokenUrl(tokenKey)}`));
      
      rl.question(chalk.white('   Enter token: '), (answer) => {
        rl.close();
        resolve(answer);
      });
    });
  }

  /**
   * Get the URL where users can obtain each token
   */
  private getTokenUrl(tokenKey: string): string {
    const urls = {
      GITHUB_TOKEN: 'https://github.com/settings/tokens',
      PINECONE_API_KEY: 'https://app.pinecone.io/organizations/-/projects/-/keys',
      HUGGINGFACE_TOKEN: 'https://huggingface.co/settings/tokens'
    };
    return urls[tokenKey as keyof typeof urls] || 'Check the service documentation';
  }

  /**
   * Save tokens to .env file
   */
  async saveTokensToEnv(tokens: TokenConfig): Promise<void> {
    try {
      // Read existing .env content to preserve other variables
      let existingOtherVars: string[] = [];
      
      if (fs.existsSync(this.envFilePath)) {
        const existingContent = fs.readFileSync(this.envFilePath, 'utf8');
        
        // Extract non-token variables
        existingContent.split('\n').forEach(line => {
          const trimmedLine = line.trim();
          if (trimmedLine && !trimmedLine.startsWith('#')) {
            const [key] = trimmedLine.split('=');
            if (key && !this.isTokenKey(key.trim())) {
              existingOtherVars.push(trimmedLine);
            }
          } else if (trimmedLine.startsWith('#')) {
            existingOtherVars.push(trimmedLine);
          }
        });
      }

      // Build new .env content
      const envLines: string[] = [];
      envLines.push('# Remcode Environment Configuration');
      envLines.push('');
      envLines.push('# API Tokens');
      
      if (tokens.GITHUB_TOKEN) {
        envLines.push(`GITHUB_TOKEN=${tokens.GITHUB_TOKEN}`);
      }
      if (tokens.PINECONE_API_KEY) {
        envLines.push(`PINECONE_API_KEY=${tokens.PINECONE_API_KEY}`);
      }
      if (tokens.HUGGINGFACE_TOKEN) {
        envLines.push(`HUGGINGFACE_TOKEN=${tokens.HUGGINGFACE_TOKEN}`);
      }

      // Add other existing variables
      if (existingOtherVars.length > 0) {
        envLines.push('');
        envLines.push('# Other Configuration');
        envLines.push(...existingOtherVars);
      }

      // Write to .env file
      const newContent = envLines.join('\n') + '\n';
      fs.writeFileSync(this.envFilePath, newContent, 'utf8');
      
      console.log(chalk.green(`✅ Tokens saved to ${path.relative(process.cwd(), this.envFilePath)}`));
      
      // Ensure .env is in .gitignore
      await this.ensureEnvInGitignore();
      
    } catch (error) {
      const errorMsg = `Failed to save tokens: ${error instanceof Error ? error.message : String(error)}`;
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Ensure .env is added to .gitignore
   */
  private async ensureEnvInGitignore(): Promise<void> {
    try {
      let gitignoreContent = '';
      let hasEnvEntry = false;

      // Read existing .gitignore
      if (fs.existsSync(this.gitignorePath)) {
        gitignoreContent = fs.readFileSync(this.gitignorePath, 'utf8');
        hasEnvEntry = gitignoreContent.includes('.env');
      }

      // Add .env to .gitignore if not present
      if (!hasEnvEntry) {
        const envEntries = [
          '',
          '# Environment variables',
          '.env',
          '.env.local',
          '.env.*.local'
        ];

        if (gitignoreContent && !gitignoreContent.endsWith('\n')) {
          gitignoreContent += '\n';
        }
        
        gitignoreContent += envEntries.join('\n') + '\n';
        fs.writeFileSync(this.gitignorePath, gitignoreContent, 'utf8');
        
        console.log(chalk.green(`✅ Added .env to ${path.relative(process.cwd(), this.gitignorePath)}`));
      } else {
        console.log(chalk.gray(`ℹ .env already in ${path.relative(process.cwd(), this.gitignorePath)}`));
      }
    } catch (error) {
      logger.warn(`Failed to update .gitignore: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Check if a key is a token key
   */
  private isTokenKey(key: string): boolean {
    const tokenKeys = ['GITHUB_TOKEN', 'PINECONE_API_KEY', 'HUGGINGFACE_TOKEN'];
    return tokenKeys.includes(key);
  }

  /**
   * Convert CLI options to token config
   */
  static cliOptionsToTokens(options: any): TokenConfig {
    return {
      GITHUB_TOKEN: options.githubToken,
      PINECONE_API_KEY: options.pineconeKey,
      HUGGINGFACE_TOKEN: options.huggingfaceToken
    };
  }
}
