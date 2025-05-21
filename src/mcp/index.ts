/**
 * MCP Server Module
 * 
 * This module provides Model Context Protocol (MCP) server functionality
 * to allow AI assistants to interact with the remcode tools.
 */

import express from 'express';
import cors from 'cors';
import { PineconeMCPHandler } from './handlers/pinecone';
import { GitHubMCPHandler } from './handlers/github';
import { getLogger } from '../utils/logger';

const logger = getLogger('MCP-Server');

export interface MCPServerOptions {
  port?: number;
  host?: string;
  pineconeApiKey?: string;
  pineconeEnvironment?: string;
  githubToken?: string;
}

export class MCPServer {
  private app: express.Application;
  private port: number;
  private host: string;
  private pineconeHandler: PineconeMCPHandler;
  private githubHandler: GitHubMCPHandler;

  constructor(options: MCPServerOptions = {}) {
    this.app = express();
    this.port = options.port || 3000;
    this.host = options.host || 'localhost';
    
    // Initialize handlers
    this.pineconeHandler = new PineconeMCPHandler({
      apiKey: options.pineconeApiKey || process.env.PINECONE_API_KEY || '',
      environment: options.pineconeEnvironment || process.env.PINECONE_ENVIRONMENT || ''
    });
    
    this.githubHandler = new GitHubMCPHandler({
      token: options.githubToken || process.env.GITHUB_TOKEN || ''
    });
    
    this.configureServer();
  }

  private configureServer(): void {
    // Configure middleware
    this.app.use(cors());
    this.app.use(express.json());
    
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({ status: 'OK' });
    });
    
    // Register MCP endpoints
    this.app.post('/v1/mcp/pinecone/:action', this.pineconeHandler.handleRequest.bind(this.pineconeHandler));
    this.app.post('/v1/mcp/github/:action', this.githubHandler.handleRequest.bind(this.githubHandler));
    
    // Main MCP endpoint that routes to the appropriate handler
    this.app.post('/v1/mcp', (req, res) => {
      const { tool } = req.body;
      
      if (tool && tool.startsWith('pinecone_')) {
        return this.pineconeHandler.handleToolRequest(req, res);
      } else if (tool && tool.startsWith('github_')) {
        return this.githubHandler.handleToolRequest(req, res);
      }
      
      res.status(400).json({ error: 'Unknown tool type' });
    });
    
    // Error handler
    this.app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error(`Error: ${err.message}`);
      res.status(500).json({ error: err.message });
    });
  }

  public async start(): Promise<void> {
    try {
      // Initialize handlers
      await this.pineconeHandler.initialize();
      
      this.app.listen(this.port, this.host, () => {
        logger.info(`MCP Server listening at http://${this.host}:${this.port}`);
      });
    } catch (error) {
      logger.error(`Failed to start MCP server: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  public stop(): void {
    // Cleanup logic if needed
    logger.info('MCP Server stopped');
  }
}