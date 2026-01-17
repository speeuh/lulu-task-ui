import axios from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  Task,
  ShopItem,
  TaskLog,
  RedemptionLog,
  User,
  UpdateUserSettingsRequest,
  TaskRequest,
  ShopItemRequest,
} from '../types';

const api = axios.create({
  baseURL: '/api',
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', data);
  return response.data;
};

// User
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>('/user/me');
  return response.data;
};

export const updateProfileImage = async (imageUrl: string): Promise<User> => {
  const response = await api.put<User>('/user/profile-image', imageUrl, {
    headers: { 'Content-Type': 'text/plain' },
  });
  return response.data;
};

export const updateSettings = async (data: UpdateUserSettingsRequest): Promise<User> => {
  const response = await api.put<User>('/user/settings', data);
  return response.data;
};

export const updateUserName = async (fullName: string): Promise<User> => {
  const response = await api.put<User>('/user/name', fullName, {
    headers: { 'Content-Type': 'text/plain' },
  });
  return response.data;
};

// Tasks
export const getUserTasks = async (): Promise<Task[]> => {
  const response = await api.get<Task[]>('/tasks');
  return response.data;
};

export const getPendingTasks = async (): Promise<Task[]> => {
  const response = await api.get<Task[]>('/tasks/pending');
  return response.data;
};

export const completeTask = async (taskId: number): Promise<Task> => {
  const response = await api.post<Task>(`/tasks/${taskId}/complete`);
  return response.data;
};

// Shop
export const getShopItems = async (): Promise<ShopItem[]> => {
  const response = await api.get<ShopItem[]>('/shop/items');
  return response.data;
};

export const redeemItem = async (itemId: number): Promise<ShopItem> => {
  const response = await api.post<ShopItem>(`/shop/items/${itemId}/redeem`);
  return response.data;
};

// Logs
export const getTaskHistory = async (): Promise<TaskLog[]> => {
  const response = await api.get<TaskLog[]>('/logs/tasks');
  return response.data;
};

export const getRedemptionHistory = async (): Promise<RedemptionLog[]> => {
  const response = await api.get<RedemptionLog[]>('/logs/redemptions');
  return response.data;
};

// Admin - Tasks
export const getAllTasks = async (): Promise<Task[]> => {
  const response = await api.get<Task[]>('/admin/tasks');
  return response.data;
};

export const createTask = async (data: TaskRequest): Promise<Task> => {
  const response = await api.post<Task>('/admin/tasks', data);
  return response.data;
};

export const updateTask = async (taskId: number, data: TaskRequest): Promise<Task> => {
  const response = await api.put<Task>(`/admin/tasks/${taskId}`, data);
  return response.data;
};

export const deleteTask = async (taskId: number): Promise<void> => {
  await api.delete(`/admin/tasks/${taskId}`);
};

// Admin - Shop Items
export const getAllShopItems = async (): Promise<ShopItem[]> => {
  const response = await api.get<ShopItem[]>('/admin/shop/items');
  return response.data;
};

export const createShopItem = async (data: ShopItemRequest): Promise<ShopItem> => {
  const response = await api.post<ShopItem>('/admin/shop/items', data);
  return response.data;
};

export const updateShopItem = async (itemId: number, data: ShopItemRequest): Promise<ShopItem> => {
  const response = await api.put<ShopItem>(`/admin/shop/items/${itemId}`, data);
  return response.data;
};

export const deleteShopItem = async (itemId: number): Promise<void> => {
  await api.delete(`/admin/shop/items/${itemId}`);
};

export default api;

