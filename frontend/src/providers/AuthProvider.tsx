import { useAuth } from "@clerk/clerk-react";
import { axiosInstance } from "@/lib/axios";
import { Loader } from "lucide-react";
import React, { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";

const updateApiToken = (token: string | null) => {
  // Update the API token in your application state or context
  if (token)
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete axiosInstance.defaults.headers.common["Authorization"];
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { getToken, userId } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const { checkAdminStatus } = useAuthStore();
  const { initSocket, disconnectSocket } = useChatStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await getToken();
        updateApiToken(token);
        if (token) {
          await checkAdminStatus();
          //init socket connection if user is authenticated
          if (userId) initSocket(userId);
        }
      } catch (error: any) {
        updateApiToken(null);
        console.error("Error fetching token:", error);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
    return () => {
      if (userId) disconnectSocket();
    };
  }, [getToken, userId, checkAdminStatus, initSocket, disconnectSocket]);
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center w-full">
        <Loader className="size-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return <div>{children}</div>;
};

export default AuthProvider;
