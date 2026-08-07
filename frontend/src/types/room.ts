export type SessionStatus = "WAITING" | "ACTIVE" | "COMPLETED" | "EXHAUSTED" | "CANCELLED";

export interface SOSRequest {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  title: string;
  description: string;
  stack: string[];
  maxMinuteRate: number;
  status: SessionStatus;
  createdAt: string;
}

export interface RoomSession {
  id: string;
  requestId: string;
  clientId: string;
  mentorId: string;
  livekitRoomToken: string;
  yjsRoomId: string;
  startedAt: string;
  status: SessionStatus;
  currentBalance: number;
  ratePerMinute: number;
}
