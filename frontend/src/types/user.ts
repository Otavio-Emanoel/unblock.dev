export type UserRole = "CLIENT" | "MENTOR" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  balance: number; // Saldo em BRL (R$)
  createdAt: string;
}

export interface MentorProfile {
  id: string;
  userId: string;
  bio: string;
  skills: string[]; // e.g. ["Go", "React", "Docker", "PostgreSQL"]
  hourlyRate: number;
  perMinuteRate: number; // e.g. R$ 2,50/min
  rating: number;
  totalSessions: number;
  isOnline: boolean;
}
