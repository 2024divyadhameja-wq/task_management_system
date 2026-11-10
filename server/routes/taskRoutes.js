const express = require("express");
const router = express.Router();
const {
  getTasks,
  getTaskStats,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const { protect, optionalAuth } = require("../middleware/authMiddleware");

// Stats summary route
router.get("/stats/summary", getTaskStats);

// Tasks CRUD routes
router.get("/", optionalAuth, getTasks);
router.get("/:id", getTaskById);
router.post("/", protect, createTask);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);

module.exports = router;

