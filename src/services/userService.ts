import api from './api';

// User interfaces
export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface UsersResponse {
  success: boolean;
  data: User[];
}

export interface UserResponse {
  success: boolean;
  data: User;
}

/**
 * Get all users (admin/staff only)
 * GET /v1/users
 */
export const getAllUsers = async (): Promise<User[]> => {
  const response = await api.get<UsersResponse>('/users');
  return response.data.data;
};


const userCache = new Map<string, User>();

/**
 * Preload all users into cache
 * Call this when loading the document verification page
 */
export const preloadUsersCache = async (): Promise<void> => {
  try {
    const users = await getAllUsers();
    users.forEach(user => {
      userCache.set(user._id, user);
    });
  } catch (error) {
    console.error('Error preloading users cache:', error);
  }
};

/**
 * Helper function to get user name and email from user object or ID
 * This is synchronous and works with populated user objects
 */
export const getUserInfo = (user: any): { name: string; email: string } => {
  if (!user) {
    return { name: 'Unknown User', email: 'No email' };
  }
  
  // If user is a string (ID), check cache
  if (typeof user === 'string') {
    if (userCache.has(user)) {
      const cachedUser = userCache.get(user)!;
      return { name: cachedUser.name, email: cachedUser.email };
    }
    return { name: 'Unknown User', email: 'No email' };
  }
  
  // If user is an object with _id
  return {
    name: user.name || 'Unknown User',
    email: user.email || 'No email',
  };
};