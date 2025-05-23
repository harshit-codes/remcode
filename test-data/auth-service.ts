import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../models/User';

/**
 * Authentication service for handling user login and token generation
 */
export class AuthService {
  private secretKey: string;
  private tokenExpiry: string;

  constructor(secretKey: string, tokenExpiry: string = '1h') {
    this.secretKey = secretKey;
    this.tokenExpiry = tokenExpiry;
  }

  /**
   * Authenticate user with email and password
   */
  async authenticateUser(email: string, password: string): Promise<AuthResult> {
    try {
      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new Error('Invalid password');
      }

      // Generate JWT token
      const token = this.generateToken(user.id, user.email);

      return {
        success: true,
        token,
        user: { id: user.id, email: user.email, name: user.name }
      };
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  /**
   * Generate JWT token for authenticated user
   */
  private generateToken(userId: string, email: string): string {
    const payload = { userId, email, iat: Date.now() };
    return jwt.sign(payload, this.secretKey, { expiresIn: this.tokenExpiry });
  }

  /**
   * Verify and decode JWT token
   */
  async verifyToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, this.secretKey) as any;
      return { userId: decoded.userId, email: decoded.email, iat: decoded.iat };
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

// Types
interface AuthResult {
  success: boolean;
  token: string;
  user: { id: string; email: string; name: string; };
}

interface TokenPayload {
  userId: string;
  email: string;
  iat: number;
}
