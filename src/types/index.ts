export enum UserRole {
  ROLE_USER = 'ROLE_USER',
  ROLE_ADMIN = 'ROLE_ADMIN',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

export enum TaskRecurrence {
  NONE = 'NONE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export enum ThemeType {
  COLOR = 'COLOR',
  IMAGE = 'IMAGE',
}

export interface User {
  id: number;
  username: string;
  fullName: string;
  role: UserRole;
  points: number;
  profileImageUrl?: string;
  themeType: ThemeType;
  themeValue: string;
  buttonColor?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  user: User;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  points: number;
  status: TaskStatus;
  recurrence: TaskRecurrence;
  createdAt: string;
  completedAt?: string;
}

export interface ShopItem {
  id: number;
  name: string;
  description?: string;
  pointsCost: number;
  imageUrl?: string;
  available: boolean;
}

export interface TaskLog {
  id: number;
  taskTitle: string;
  pointsEarned: number;
  completedAt: string;
}

export interface RedemptionLog {
  id: number;
  itemName: string;
  pointsSpent: number;
  redeemedAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TaskRequest {
  title: string;
  description?: string;
  points: number;
  userId: number;
  recurrence?: TaskRecurrence;
}

export interface ShopItemRequest {
  name: string;
  description?: string;
  pointsCost: number;
  imageUrl?: string;
}

export interface UpdateUserSettingsRequest {
  themeType: ThemeType;
  themeValue: string;
  buttonColor?: string;
}

