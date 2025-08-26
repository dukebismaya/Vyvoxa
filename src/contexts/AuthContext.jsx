import React, { createContext, useContext, useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Simulate JWT token generation
const generateToken = (userId, email) => {
  const payload = {
    userId,
    email,
    exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    iat: Date.now()
  };
  return btoa(JSON.stringify(payload));
};

// Hash password for storage (client-side simulation)
const hashPassword = (password) => {
  return CryptoJS.SHA256(password).toString();
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const token = localStorage.getItem('vyvoxa_token');
      if (token) {
        const payload = JSON.parse(atob(token));
        
        // Check if token is expired
        if (payload.exp > Date.now()) {
          const userData = localStorage.getItem('vyvoxa_user');
          if (userData) {
            const user = JSON.parse(userData);
            setCurrentUser(user);
            setIsAuthenticated(true);
          }
        } else {
          // Token expired, clear storage
          localStorage.removeItem('vyvoxa_token');
          localStorage.removeItem('vyvoxa_user');
        }
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = async (email, password, name) => {
    try {
      // Get existing users
      const existingUsers = JSON.parse(localStorage.getItem('vyvoxa_users') || '[]');
      
      // Check if user already exists
      if (existingUsers.find(user => user.email === email)) {
        throw new Error('User already exists with this email');
      }

      // Create new user
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const hashedPassword = hashPassword(password);
      
      const newUser = {
        id: userId,
        email,
        name,
        password: hashedPassword,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        createdAt: Date.now(),
        isVerified: false
      };

      // Save user to storage
      const updatedUsers = [...existingUsers, newUser];
      localStorage.setItem('vyvoxa_users', JSON.stringify(updatedUsers));

      // Generate token and set current user
      const token = generateToken(userId, email);
      const userWithoutPassword = { ...newUser };
      delete userWithoutPassword.password;

      localStorage.setItem('vyvoxa_token', token);
      localStorage.setItem('vyvoxa_user', JSON.stringify(userWithoutPassword));

      setCurrentUser(userWithoutPassword);
      setIsAuthenticated(true);

      return { success: true, user: userWithoutPassword };
    } catch (error) {
      throw new Error(error.message || 'Failed to create account');
    }
  };

  const login = async (email, password) => {
    try {
      const users = JSON.parse(localStorage.getItem('vyvoxa_users') || '[]');
      const user = users.find(u => u.email === email);

      if (!user) {
        throw new Error('No account found with this email');
      }

      const hashedPassword = hashPassword(password);
      if (user.password !== hashedPassword) {
        throw new Error('Invalid password');
      }

      // Generate token and set current user
      const token = generateToken(user.id, email);
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;

      localStorage.setItem('vyvoxa_token', token);
      localStorage.setItem('vyvoxa_user', JSON.stringify(userWithoutPassword));

      setCurrentUser(userWithoutPassword);
      setIsAuthenticated(true);

      return { success: true, user: userWithoutPassword };
    } catch (error) {
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const logout = () => {
    localStorage.removeItem('vyvoxa_token');
    localStorage.removeItem('vyvoxa_user');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const resetPassword = async (email) => {
    try {
      const users = JSON.parse(localStorage.getItem('vyvoxa_users') || '[]');
      const user = users.find(u => u.email === email);

      if (!user) {
        throw new Error('No account found with this email');
      }

      // In a real app, you'd send an email here
      // For demo purposes, we'll just show a success message
      return { success: true, message: 'Password reset instructions sent to your email' };
    } catch (error) {
      throw new Error(error.message || 'Failed to reset password');
    }
  };

  const updateProfile = async (updates) => {
    try {
      const users = JSON.parse(localStorage.getItem('vyvoxa_users') || '[]');
      const userIndex = users.findIndex(u => u.id === currentUser.id);

      if (userIndex === -1) {
        throw new Error('User not found');
      }

      // Update user in storage
      users[userIndex] = { ...users[userIndex], ...updates };
      localStorage.setItem('vyvoxa_users', JSON.stringify(users));

      // Update current user
      const updatedUser = { ...users[userIndex] };
      delete updatedUser.password;
      
      localStorage.setItem('vyvoxa_user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);

      return { success: true, user: updatedUser };
    } catch (error) {
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
