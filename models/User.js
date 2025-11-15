// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },              // 使用者名稱
    email: { type: String, required: true, unique: true }, // 登入用 email
    passwordHash: { type: String, required: true },      // 密碼雜湊（不存明碼）
    role: {
      type: String,
      enum: ["citizen", "community", "admin"],           // 公民 / 社區端 / 管理者
      default: "citizen",
    },
    points: { type: Number, default: 0 },                // 城市花園積分
    level: { type: Number, default: 1 },                 // 等級（之後可以用公式算）
  },
  { timestamps: true }
);

// 設定密碼（註冊、改密碼時用）
UserSchema.methods.setPassword = async function (plain) {
  this.passwordHash = await bcrypt.hash(plain, 10);
};

// 檢查密碼（登入時用）
UserSchema.methods.checkPassword = async function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

module.exports = mongoose.model("User", UserSchema);
