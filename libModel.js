import mongoose from "mongoose";
import findOrCreate from "mongoose-findorcreate";
const libSchema = new mongoose.Schema(
  {
    googleId: String,
    library: Array
  },
  { versionKey: false }
);

// userSchema.plugin(passportLocalMongoose);
libSchema.plugin(findOrCreate);

export const Lib = new mongoose.model("Lib", libSchema);