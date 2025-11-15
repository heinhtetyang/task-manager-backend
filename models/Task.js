// models/Task.js
const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },           // 任務標題
    description: { type: String },                     // 任務內容說明
    type: {                                            // 任務類型
      type: String,
      enum: ["environment", "facility", "donation", "sharing", "other"],
      default: "other",
    },
    points: { type: Number, default: 10 },             // 完成可得幾點
    status: {                                          // 任務狀態（任務本身）
      type: String,
      enum: ["open", "in_progress", "closed"],
      default: "open",
    },

    // 位置相關（LBS）
    locationName: String,                              // 顯示用地點名稱
    address: String,
    lat: Number,
    lng: Number,

    // 誰發布的（社區端）
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // 任務有效時間
    startTime: Date,
    endTime: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);
