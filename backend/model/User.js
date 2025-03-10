import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  auth0Id: { type: String, required: true, unique: true },
  name: String,
  email: { type: String, required: true, unique: true },
  picture: String,
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);

export default User;
