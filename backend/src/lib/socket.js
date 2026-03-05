import { Server } from "socket.io";
import { Message } from "../models/message.model.js";

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });
  const userSocket = new Map(); // userId -> socket
  const userActivities = new Map(); // userId -> activity

  io.on("connection", (socket) => {
    socket.on("user_connected", (userId) => {
      userSocket.set(userId, socket.id);
      userActivities.set(userId, "idle");
      // notify all clients about the new user connection
      io.emit("user_connected", userId);
      socket.emit("users_online", Array.from(userSocket.keys()));
      io.emit("activities", Array.from(userActivities.entries()));
    });
    socket.on("update_activity", ({ userId, activity }) => {
      console.log(`Received activity update from user ${userId}: ${activity}`);
      userActivities.set(userId, activity);
      io.emit("activity_updated", { userId, activity });
    });
    socket.on("send_message", async (data) => {
      try {
        const { senderId, receiverId, content } = data;

        const message = await Message.create({
          senderId,
          receiverId,
          content,
        }); // creates as well as saves to DB

        const receiverSocketId = userSocket.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_message", message);
        }
        socket.emit("message_sent", message);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("message_error", error.message);
      }
    });
    socket.on("disconnect", () => {
      for (const [userId, userSocketId] of userSocket.entries()) {
        if (userSocketId === socket.id) {
          userSocket.delete(userId);
          userActivities.delete(userId);
          io.emit("user_disconnected", userId);
          //io.emit("activities", Array.from(userActivities.entries()));
          break;
        }
      }
    });
  });
};
