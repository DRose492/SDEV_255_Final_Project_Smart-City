const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ["teacher", "student"] },

  // ⭐ Stage 2: student schedule
  enrolledCourses: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Course" }
  ]
});

module.exports = mongoose.model("User", UserSchema);
