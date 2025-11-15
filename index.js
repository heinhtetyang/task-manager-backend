const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); 

require("dotenv").config();

const Task = require("./models/Task");
const Participation = require("./models/Participation");

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json());

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

console.log("MONGO_URI =", MONGO_URI);

if (!MONGO_URI) {
  console.error("❌ MONGO_URI 沒有設定，請檢查 .env 是否放在專案根目錄");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log("✅ 已連線 MongoDB");

    // --- 測試首頁 ---
    app.get("/", (req, res) => {
      res.send("城事 GO backend OK !");
    });

    // -------------------
    // 任務（Task）API
    // -------------------

    // 取得所有任務
    app.get("/tasks", async (req, res) => {
      try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.json(tasks);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "server_error" });
      }
    });

    // 新增任務
    app.post("/tasks", async (req, res) => {
      try {
        const task = await Task.create(req.body);
        res.status(201).json(task);
      } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
      }
    });

    // --------------------------
    // 任務流程：claim / submit / review
    // --------------------------

    // 1) 使用者按「我要完成」：claim 任務
    app.post("/tasks/:taskId/claim", async (req, res) => {
      try {
        const { taskId } = req.params;
        const { userName } = req.body;

        if (!userName) {
          return res.status(400).json({ error: "userName_required" });
        }

        // 如果這個人已經 claim 過同一個任務，就直接回傳那筆記錄
        let participation = await Participation.findOne({ task: taskId, userName });

        if (!participation) {
          participation = await Participation.create({
            task: taskId,
            userName,
            status: "claimed",
          });
        }

        res.json(participation);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "server_error" });
      }
    });

    // 2) 使用者上傳完成證明：submit
    app.post("/tasks/:taskId/submit", async (req, res) => {
      try {
        const { taskId } = req.params;
        const { userName, proofNote } = req.body;

        if (!userName) {
          return res.status(400).json({ error: "userName_required" });
        }

        let participation = await Participation.findOne({ task: taskId, userName });

        if (!participation) {
          // 還沒 claim 過就幫他建一筆
          participation = new Participation({
            task: taskId,
            userName,
          });
        }

        participation.proofNote = proofNote || "";
        participation.status = "submitted";
        await participation.save();

        res.json(participation);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "server_error" });
      }
    });

    // 3) 社區端：查看所有 participation
    app.get("/participations", async (req, res) => {
      try {
        const list = await Participation.find()
          .populate("task")
          .sort({ createdAt: -1 });
        res.json(list);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "server_error" });
      }
    });

    // 4) 社區端：只看「待審核」的 participation
    app.get("/participations/pending", async (req, res) => {
      try {
        const list = await Participation.find({ status: "submitted" })
          .populate("task")
          .sort({ createdAt: 1 });
        res.json(list);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "server_error" });
      }
    });

    // 5) 社區端審核：approved / rejected
    app.post("/participations/:id/review", async (req, res) => {
      try {
        const { id } = req.params;
        const { approve, reviewNote } = req.body;

        const participation = await Participation.findById(id).populate("task");
        if (!participation) {
          return res.status(404).json({ error: "participation_not_found" });
        }

        participation.status = approve ? "approved" : "rejected";
        participation.reviewNote = reviewNote || "";
        await participation.save();

        res.json(participation);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "server_error" });
      }
    });

    // -------------------

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });
