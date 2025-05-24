/**
 * Port Management Utilities
 * 
 * Handles smart port selection with auto-increment and availability checking
 */

import { createServer } from 'net';
import chalk from 'chalk';
import { getLogger } from './logger';

const logger = getLogger('PortManager');

export interface PortResult {
  port: number;
  available: boolean;
  autoSelected?: boolean;
}

/**
 * Port Manager class for handling port selection
 */
export class PortManager {
  /**
   * Check if a port is available
   */
  static async isPortAvailable(port: number): Promise<boolean> {
    // Check both IPv4 and IPv6
    const ipv4Available = await this.checkPortOnInterface(port, '127.0.0.1');
    const ipv6Available = await this.checkPortOnInterface(port, '::1');
    
    return ipv4Available && ipv6Available;
  }

  /**
   * Check if a port is available on a specific interface
   */
  private static async checkPortOnInterface(port: number, host: string): Promise<boolean> {
    return new Promise((resolve) => {
      const server = createServer();
      
      server.listen(port, host, () => {
        server.close(() => {
          resolve(true);
        });
      });
      
      server.on('error', () => {
        resolve(false);
      });
    });
  }

  /**
   * Find an available port starting from the preferred port
   */
  static async findAvailablePort(preferredPort: number, maxAttempts: number = 10): Promise<PortResult> {
    let currentPort = preferredPort;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const available = await this.isPortAvailable(currentPort);
      
      if (available) {
        return {
          port: currentPort,
          available: true,
          autoSelected: attempt > 0
        };
      }
      
      logger.info(`Port ${currentPort} is busy, trying ${currentPort + 1}`);
      currentPort++;
    }
    
    return {
      port: preferredPort,
      available: false
    };
  }

  /**
   * Get an available port with user-friendly messaging
   */
  static async getAvailablePort(preferredPort: number): Promise<number> {
    console.log(chalk.gray(`🔍 Checking port availability...`));
    
    const result = await this.findAvailablePort(preferredPort);
    
    if (!result.available) {
      console.log(chalk.red(`❌ Could not find an available port after ${preferredPort + 9}`));
      console.log(chalk.yellow(`💡 Try specifying a different port: --port ${preferredPort + 100}`));
      throw new Error(`No available ports found starting from ${preferredPort}`);
    }
    
    if (result.autoSelected) {
      console.log(chalk.yellow(`⚠ Port ${preferredPort} was busy`));
      console.log(chalk.green(`✅ Auto-selected available port: ${result.port}`));
    } else {
      console.log(chalk.green(`✅ Port ${result.port} is available`));
    }
    
    return result.port;
  }
}
