import mongoose from "mongoose";
import findOrCreate from "mongoose-findorcreate";
const userSchema = new mongoose.Schema(
  {
    username: String,
    name: String,
    googleId: String,
    picture: String,
    email: String,
  },
  { versionKey: false }
);

// userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

export const User = new mongoose.model("User", userSchema);