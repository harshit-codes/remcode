      roles: JSON.parse(row.roles || '["user"]'),
      createdAt: new Date(row.created_at),
      lastLogin: row.last_login ? new Date(row.last_login) : undefined
    };
  }

  async getAllUsers(limit: number = 100): Promise<User[]> {
    const query = `SELECT * FROM users ORDER BY created_at DESC LIMIT ?`;
    const results = await this.executeQuery(query, [limit]);
    
    return results.map(row => this.mapRowToUser(row));
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      const query = `DELETE FROM users WHERE id = ?`;
      await this.executeQuery(query, [userId]);
      
      this.cache.delete(userId);
      return true;
    } catch (error) {
      console.error('Failed to delete user:', error);
      return false;
    }
  }

  async updateUserRoles(userId: string, roles: string[]): Promise<User | null> {
    const user = await this.findUserById(userId);
    if (!user) {
      return null;
    }

    user.roles = roles;
    await this.saveUser(user);
    this.cache.set(userId, user);
    
    return user;
  }

  private async findUserById(userId: string): Promise<User | null> {
    // Check cache first
    if (this.cache.has(userId)) {
      return this.cache.get(userId)!;
    }

    const query = `SELECT * FROM users WHERE id = ?`;
    const result = await this.executeQuery(query, [userId]);
    
    if (result.length > 0) {
      const user = this.mapRowToUser(result[0]);
      this.cache.set(user.id, user);
      return user;
    }

    return null;
  }

  async validateUserPermissions(userId: string, requiredRole: string): Promise<boolean> {
    const user = await this.findUserById(userId);
    if (!user) {
      return false;
    }

    return user.roles.includes(requiredRole) || user.roles.includes('admin');
  }

  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// Export for testing
export { UserService, User, DatabaseConnection };

// Example usage patterns
async function exampleUsage() {
  const connection: DatabaseConnection = {
    host: 'localhost',
    port: 5432,
    database: 'testdb',
    username: 'user',
    password: 'password'
  };

  const userService = new UserService(connection);

  // Authentication flow
  const authenticatedUser = await userService.authenticate('test@example.com', 'password123');
  
  if (authenticatedUser) {
    console.log('User authenticated:', authenticatedUser.name);
    
    // Check permissions
    const hasAdminAccess = await userService.validateUserPermissions(
      authenticatedUser.id, 
      'admin'
    );
    
    if (hasAdminAccess) {
      // Admin operations
      const allUsers = await userService.getAllUsers(50);
      console.log(`Total users: ${allUsers.length}`);
    }
  }

  // User management
  const newUser = await userService.createUser({
    email: 'newuser@example.com',
    name: 'New User',
    roles: ['user', 'editor']
  });

  console.log('Created user:', newUser.id);
}
