import { useEffect, useState } from "react";
import io from "socket.io-client";

let socketInstance = null;

// Initialize socket connection
const initializeSocket = () => {
  if (socketInstance) return socketInstance;

  socketInstance = io(import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:8000", {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socketInstance.on("connect", () => {
    console.log("✅ Socket connected:", socketInstance.id);
  });

  socketInstance.on("disconnect", () => {
    console.log("❌ Socket disconnected");
  });

  socketInstance.on("error", (error) => {
    console.error("Socket error:", error);
  });

  return socketInstance;
};

export const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const sock = initializeSocket();
    setSocket(sock);

    return () => {
      // Don't disconnect on unmount - keep connection alive for other components
    };
  }, []);

  return socket;
};

// Export socket instance directly for backward compatibility
export default initializeSocket();
