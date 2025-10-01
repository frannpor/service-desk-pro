export enum UserRole {
  REQUESTER = "REQUESTER",
  AGENT = "AGENT",
  MANAGER = "MANAGER",
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  email: string
  name: string
  password: string
  role?: UserRole
}

export interface AuthResponse {
  user: User
  token: string
}
