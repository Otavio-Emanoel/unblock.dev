export type UserRole = "client" | "mentor" | "admin" | "CLIENT" | "MENTOR" | "ADMIN";

export interface Wallet {
  balance_cents: number;
  currency: string;
}

export interface MentorProfile {
  id?: string;
  userId?: string;
  bio: string;
  skills: string[]; // e.g. ["Go", "React", "Docker", "PostgreSQL"]
  hourlyRate?: number;
  perMinuteRate?: number;
  minute_rate_cents?: number;
  rating?: number;
  rating_avg?: number;
  totalRatings?: number;
  total_ratings?: number;
  totalSessions?: number;
  total_sessions?: number;
  isOnline?: boolean;
  is_online?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  avatarUrl?: string;
  role: UserRole;
  wallet?: Wallet;
  balance?: number; // Saldo em BRL (R$)
  mentor_profile?: MentorProfile;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}
