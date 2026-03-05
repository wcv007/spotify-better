import { clerkClient } from "@clerk/express";

export const protectRoute = async (req, res, next) => {
  try {
    const { userId } = await req.auth();
    console.log("protectRoute - userId:", req.baseUrl, userId);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized - must log in" });
    }
    next();
  } catch (err) {
    console.error("Error in protectRoute middleware", err);
    res.status(401).json({ message: "Unauthorized - must log in" });
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    const { userId } = await req.auth();
    console.log("requireAdmin - userId:", userId);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const currentUser = await clerkClient.users.getUser(userId);
    console.log(
      currentUser?.primaryEmailAddress?.emailAddress,
      process.env.ADMIN_EMAIL,
    );
    const isAdmin =
      process.env.ADMIN_EMAIL ===
      currentUser?.primaryEmailAddress?.emailAddress;

    if (!isAdmin) {
      return res.status(403).json({ message: "Forbidden - admin access only" });
    }

    next();
  } catch (err) {
    console.log("Error in requireAdmin middleware", err);
    next(err);
  }
};
