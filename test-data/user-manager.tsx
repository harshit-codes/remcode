import React, { useState, useEffect } from 'react';
import { User } from '../types/User';
import { fetchUsers, createUser, updateUser, deleteUser } from '../api/userApi';

/**
 * User management component with CRUD operations
 */
export const UserManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const userData = await fetchUsers();
      setUsers(userData);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData: Partial<User>) => {
    try {
      const newUser = await createUser(userData);
      setUsers(prev => [...prev, newUser]);
    } catch (err) {
      setError('Failed to create user');
    }
  };

  const handleUpdateUser = async (id: string, userData: Partial<User>) => {
    try {
      const updatedUser = await updateUser(id, userData);
      setUsers(prev => prev.map(user => 
        user.id === id ? updatedUser : user
      ));
    } catch (err) {
      setError('Failed to update user');
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteUser(id);
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  return (
    <div className="user-manager">
      <h2>User Management</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="error">{error}</div>}
      {/* Component JSX would continue here */}
    </div>
  );
};
