import { User } from "../models/user.model.js";
export const authCallback = async (req, res, next) => {
  try {
    const { id, firstName, lastName, imageUrl } = req.body;
    console.log("Auth callback received:", {
      id,
      firstName,
      lastName,
      imageUrl,
    });

    // check if user already exists
    const user = await User.findOne({ clerkId: id });
    if (!user) {
      //signUp
      console.log("Creating new user...");
      const newUser = await User.create({
        clerkId: id,
        fullName: `${firstName || ""} ${lastName || ""}`,
        imageUrl: imageUrl || null,
      });
      console.log("User created successfully:", newUser);
    } else {
      console.log("User already exists:", user);
    }
    res.status(200).json({ success: true });
  } catch (err) {
    console.log("Error in auth callback", err);
    next(err);
  }
};
