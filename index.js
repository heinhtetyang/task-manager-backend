const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Task = require("./models/Task");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ 這裡要用 mongoose.connect("字串")
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));


app.get("/tasks", async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

app.post("/tasks", async (req, res) => {
  const task = await Task.create(req.body);
  res.json(task);
});

app.put("/tasks/:id", async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(task);
});

app.delete("/tasks/:id", async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Task deleted" });
});

app.listen(3001, () => console.log("Server running on port 3001"));
