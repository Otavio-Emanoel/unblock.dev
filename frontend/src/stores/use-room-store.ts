import { create } from "zustand";

interface RoomState {
  roomId: string | null;
  isMicMuted: boolean;
  isCamMuted: boolean;
  isScreenSharing: boolean;
  activeLanguage: string;
  setRoomId: (id: string | null) => void;
  toggleMic: () => void;
  toggleCam: () => void;
  toggleScreenShare: () => void;
  setActiveLanguage: (lang: string) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  roomId: null,
  isMicMuted: false,
  isCamMuted: false,
  isScreenSharing: false,
  activeLanguage: "typescript",
  setRoomId: (roomId) => set({ roomId }),
  toggleMic: () => set((state) => ({ isMicMuted: !state.isMicMuted })),
  toggleCam: () => set((state) => ({ isCamMuted: !state.isCamMuted })),
  toggleScreenShare: () =>
    set((state) => ({ isScreenSharing: !state.isScreenSharing })),
  setActiveLanguage: (activeLanguage) => set({ activeLanguage }),
}));
