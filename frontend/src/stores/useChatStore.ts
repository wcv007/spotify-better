import { axiosInstance } from "@/lib/axios";
import type { Message, User } from "@/types";
import { create } from "zustand";
import { io } from "socket.io-client";

interface ChatStore {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  socket: any;
  isConnected: boolean;
  onlineUsers: Set<string>;
  userActivities: Map<string, string>;
  selectedUser: User | null;
  messages: Message[];
  initSocket: (userId: string) => void;
  sendMessage: (senderId: string, receiverId: string, content: string) => void;
  disconnectSocket: () => void;
  fetchMessages: (userId: string) => Promise<void>;
  setSelectedUser: (user: User | null) => void;
}

const baseURL =
  import.meta.env.MODE === "development" ? "http://localhost:5000" : "/";
const socket = io(baseURL, {
  autoConnect: false,
  withCredentials: true,
});

export const useChatStore = create<ChatStore>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,
  socket: socket,
  isConnected: false,
  onlineUsers: new Set(),
  userActivities: new Map(),
  messages: [],
  selectedUser: null,
  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/users", {
        withCredentials: true,
      });
      set({ users: response.data });
    } catch (error: any) {
      set({ error: error.response.data.message });
    } finally {
      set({ isLoading: false });
    }
  },
  initSocket: (userId: string) => {
    if (!get().isConnected) {
      socket.auth = { userId };
      socket.connect();
      socket.emit("user_connected", userId);
      socket.on("users_online", (users: string[]) => {
        set({ onlineUsers: new Set(users) });
      });
      socket.on("activities", (activities: [string, string][]) => {
        set({ userActivities: new Map(activities) });
      });
      socket.on("user_connected", (userId: string) => {
        set((state) => ({
          onlineUsers: new Set([...state.onlineUsers, userId]),
        }));
      });
      socket.on("user_disconnected", (userId: string) => {
        set((state) => {
          const updatedOnlineUsers = new Set(state.onlineUsers);
          updatedOnlineUsers.delete(userId);
          return { onlineUsers: updatedOnlineUsers };
        });
      });
      socket.on("receive_message", (message: Message) => {
        set((state) => {
          // avoid adding a message twice if it already exists
          if (state.messages.some((m) => m._id === message._id)) {
            return state;
          }
          return {
            messages: [...state.messages, message],
          };
        });
      });

      socket.on("message_sent", (message: Message) => {
        set((state) => {
          if (state.messages.some((m) => m._id === message._id)) {
            return state;
          }
          return {
            messages: [...state.messages, message],
          };
        });
      });
      socket.on(
        "acitivity_updated",
        ({ userId, activity }: { userId: string; activity: string }) => {
          set((state) => {
            const updatedActivities = new Map(state.userActivities);
            updatedActivities.set(userId, activity);
            return { userActivities: updatedActivities };
          });
        },
      );
      set({ isConnected: true });
    }
  },
  sendMessage: (senderId, receiverId, content) => {
    const socket = get().socket;
    if (!socket) return;
    socket.emit("send_message", { senderId, receiverId, content });
  },
  disconnectSocket: () => {
    if (get().isConnected) {
      socket.disconnect();
      set({ isConnected: false });
    }
  },
  fetchMessages: async (userId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axiosInstance.get(`users/messages/${userId}`);
      set({ messages: response.data });
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      set({ error: error.response.data.message });
    } finally {
      set({ isLoading: false });
    }
  },
  setSelectedUser: (user) => {
    set({ selectedUser: user });
  },
}));
