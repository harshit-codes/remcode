// API client for user management operations
export class UserApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async getAllUsers(): Promise<User[]> {
    const response = await fetch(`${this.baseUrl}/users`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status}`);
    }
    
    return response.json();
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await fetch(`${this.baseUrl}/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.status}`);
    }
    
    return response.json();
  }

  async updateUser(id: string, updates: UpdateUserRequest): Promise<User> {
    const response = await fetch(`${this.baseUrl}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update user: ${response.status}`);
    }
    
    return response.json();
  }
}

interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
}
