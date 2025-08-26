import React, { createContext, useContext, useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import { logError } from '@/lib/config';

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
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);

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
      logError(error, 'Loading user from localStorage');
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = async (email, password, name, additionalData = {}) => {
    try {
      // Get existing users
      const existingUsers = JSON.parse(localStorage.getItem('vyvoxa_users') || '[]');
      
      // Check if user already exists
      if (existingUsers.find(user => user.email === email)) {
        throw new Error('User already exists with this email');
      }

      // Create new user with enhanced profile
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const hashedPassword = hashPassword(password);
      
      const newUser = {
        id: userId,
        email,
        name,
        password: hashedPassword,
        avatar: additionalData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`,
        bio: additionalData.bio || `Hey there! I'm ${name.split(' ')[0]} and I'm new to Vyvoxa! 👋`,
        location: additionalData.location || '',
        website: additionalData.website || '',
        coverPhoto: additionalData.coverPhoto || 'https://images.unsplash.com/photo-1519638831568-d9897f573d12?w=800&h=200&fit=crop',
        joinedAt: Date.now(),
        isVerified: false,
        isOnline: true,
        lastSeen: Date.now(),
        followers: [],
        following: [],
        postsCount: 0,
        settings: {
          privacy: 'public', // public, friends, private
          notifications: true,
          darkMode: true,
          language: 'en'
        },
        interests: additionalData.interests || [],
        socialLinks: {
          twitter: '',
          linkedin: '',
          instagram: ''
        }
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
      users[userIndex] = { ...users[userIndex], ...updates, lastSeen: Date.now() };
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

  // Friend system functions
  const sendFriendRequest = async (targetUserId) => {
    try {
      const users = JSON.parse(localStorage.getItem('vyvoxa_users') || '[]');
      const requests = JSON.parse(localStorage.getItem('vyvoxa_friend_requests') || '[]');
      
      // Check if request already exists
      const existingRequest = requests.find(req => 
        req.senderId === currentUser.id && req.receiverId === targetUserId
      );
      
      if (existingRequest) {
        throw new Error('Friend request already sent');
      }

      // Add friend request
      const newRequest = {
        id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        senderId: currentUser.id,
        receiverId: targetUserId,
        status: 'pending',
        sentAt: Date.now()
      };

      requests.push(newRequest);
      localStorage.setItem('vyvoxa_friend_requests', JSON.stringify(requests));

      return { success: true };
    } catch (error) {
      throw new Error(error.message || 'Failed to send friend request');
    }
  };

  const acceptFriendRequest = async (requestId) => {
    try {
      const users = JSON.parse(localStorage.getItem('vyvoxa_users') || '[]');
      const requests = JSON.parse(localStorage.getItem('vyvoxa_friend_requests') || '[]');
      
      const requestIndex = requests.findIndex(req => req.id === requestId);
      if (requestIndex === -1) {
        throw new Error('Friend request not found');
      }

      const request = requests[requestIndex];
      
      // Update users' friend lists
      const senderIndex = users.findIndex(u => u.id === request.senderId);
      const receiverIndex = users.findIndex(u => u.id === request.receiverId);
      
      if (senderIndex !== -1 && receiverIndex !== -1) {
        users[senderIndex].followers = users[senderIndex].followers || [];
        users[senderIndex].following = users[senderIndex].following || [];
        users[receiverIndex].followers = users[receiverIndex].followers || [];
        users[receiverIndex].following = users[receiverIndex].following || [];
        
        // Add each other as friends
        if (!users[senderIndex].following.includes(request.receiverId)) {
          users[senderIndex].following.push(request.receiverId);
        }
        if (!users[receiverIndex].followers.includes(request.senderId)) {
          users[receiverIndex].followers.push(request.senderId);
        }
        if (!users[receiverIndex].following.includes(request.senderId)) {
          users[receiverIndex].following.push(request.senderId);
        }
        if (!users[senderIndex].followers.includes(request.receiverId)) {
          users[senderIndex].followers.push(request.receiverId);
        }
      }

      // Remove friend request
      requests.splice(requestIndex, 1);
      
      localStorage.setItem('vyvoxa_users', JSON.stringify(users));
      localStorage.setItem('vyvoxa_friend_requests', JSON.stringify(requests));

      return { success: true };
    } catch (error) {
      throw new Error(error.message || 'Failed to accept friend request');
    }
  };

  const getFriendRequests = () => {
    try {
      const requests = JSON.parse(localStorage.getItem('vyvoxa_friend_requests') || '[]');
      const users = JSON.parse(localStorage.getItem('vyvoxa_users') || '[]');
      
      return requests
        .filter(req => req.receiverId === currentUser.id && req.status === 'pending')
        .map(req => {
          const sender = users.find(u => u.id === req.senderId);
          return {
            ...req,
            sender: sender ? { ...sender, password: undefined } : null
          };
        });
    } catch (error) {
      return [];
    }
  };

  const getAllUsers = () => {
    try {
      const users = JSON.parse(localStorage.getItem('vyvoxa_users') || '[]');
      return users
        .filter(u => u.id !== currentUser.id)
        .map(u => ({ ...u, password: undefined }));
    } catch (error) {
      return [];
    }
  };

  const getFriends = () => {
    try {
      const users = JSON.parse(localStorage.getItem('vyvoxa_users') || '[]');
      const currentUserData = users.find(u => u.id === currentUser?.id);
      
      if (!currentUserData || !currentUserData.following) {
        return [];
      }
      
      return currentUserData.following;
    } catch (error) {
      return [];
    }
  };

  const isFollowing = (userId) => {
    try {
      const friends = getFriends();
      return friends.includes(userId);
    } catch (error) {
      return false;
    }
  };

  const getFollowingPosts = (allPosts) => {
    try {
      const friends = getFriends();
      return allPosts.filter(post => friends.includes(post.userId));
    } catch (error) {
      return [];
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
    updateProfile,
    sendFriendRequest,
    acceptFriendRequest,
    getFriendRequests,
    getAllUsers,
    getFriends,
    isFollowing,
    getFollowingPosts,
    friendRequests,
    friends
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
