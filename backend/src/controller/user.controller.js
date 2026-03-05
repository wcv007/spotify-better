import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const { userId: currentUser } = await req.auth();
    console.log("getAllUsers - currentUser:", currentUser);
    const users = await User.find({
      clerkId: { $ne: currentUser },
    });

    res.status(200).json(users);
  } catch (err) {
    console.log("Error in getAllUsers", err);
    next(err);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const myId = req.auth.userId;
    const { userId } = req.params;
    console.log("getMessages - currentUser:", myId, "userId:", userId);
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userId },
        { senderId: userId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (err) {
    console.log("Error in getMessages", err);
    next(err);
  }
};
