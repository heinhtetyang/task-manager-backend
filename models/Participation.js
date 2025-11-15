// models/Participation.js
const mongoose = require("mongoose");

// 用來紀錄「某個人對某個任務」的狀態
const ParticipationSchema = new mongoose.Schema(
  {
    // 先不用登入，所以只記一個暱稱 / 名字字串就好
    userName: { type: String, required: true },

    // 關聯到哪一個 Task
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },

    // 任務進度（對這個使用者來說）
    status: {
      type: String,
      enum: ["claimed", "submitted", "approved", "rejected"],
      default: "claimed",
    },

    // 使用者上傳的證明（先用文字，之後可以改成圖片 URL）
    proofNote: String,

    // 社區端審核留言
    reviewNote: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Participation", ParticipationSchema);
