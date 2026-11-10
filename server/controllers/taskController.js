const mongoose = require("mongoose");
const Task = require("../models/Task");

// Helper to sanitize and validate task input
function validateTaskInput(body) {
  const { title, description, priority, status, dueDate, project, assignedTo, assignedToEmail } = body;

  if (typeof title !== "string" || !title.trim()) {
    return { error: "Task title is required" };
  }
  if (typeof description !== "string" || !description.trim()) {
    return { error: "Task description is required" };
  }
  if (!dueDate || (typeof dueDate === "string" && !dueDate.trim())) {
    return { error: "Task due date is required" };
  }

  const validPriorities = ["Low", "Medium", "High"];
  const sanitizedPriority = validPriorities.includes(priority) ? priority : "Medium";

  const validStatuses = ["Pending", "In Progress", "Completed"];
  const sanitizedStatus = validStatuses.includes(status) ? status : "Pending";

  return {
    data: {
      title: title.trim(),
      description: description.trim(),
      priority: sanitizedPriority,
      status: sanitizedStatus,
      dueDate: typeof dueDate === "string" ? dueDate.trim() : new Date(dueDate).toISOString().split("T")[0],
      project: (project && typeof project === "string" && project.trim()) || "General",
      assignedTo: assignedTo && mongoose.isValidObjectId(assignedTo) ? assignedTo : undefined,
      assignedToEmail: assignedToEmail && typeof assignedToEmail === "string" ? assignedToEmail.trim() : undefined,
    },
  };
}

// GET /api/tasks
// Retrieve all tasks with optional search, filter and user filtering
async function getTasks(req, res) {
  try {
    const { search, status, priority, myTasks, project } = req.query;
    const filter = {};

    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }

    if (status && status !== "All") {
      filter.status = status;
    }

    if (priority && priority !== "All") {
      filter.priority = priority;
    }

    if (project && project !== "All") {
      filter.project = project;
    }

    // If myTasks requested or user is filtered
    if (myTasks === "true" && req.user) {
      filter.$or = [
        { assignedTo: req.user._id },
        { assignedToEmail: req.user.email },
        { createdBy: req.user._id },
      ];
    }

    const tasks = await Task.find(filter)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error retrieving tasks:", error.message);
    res.status(500).json({
      message: "Failed to retrieve tasks",
    });
  }
}

// GET /api/tasks/stats/summary
// Retrieve dashboard statistics
async function getTaskStats(req, res) {
  try {
    const totalTasks = await Task.countDocuments();
    const pendingTasks = await Task.countDocuments({ status: "Pending" });
    const inProgressTasks = await Task.countDocuments({ status: "In Progress" });
    const completedTasks = await Task.countDocuments({ status: "Completed" });

    res.status(200).json({
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
    });
  } catch (error) {
    console.error("Error retrieving task stats:", error.message);
    res.status(500).json({ message: "Failed to retrieve task statistics" });
  }
}

// GET /api/tasks/:id
// Retrieve single task
async function getTaskById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    const task = await Task.findById(id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Error retrieving task:", error.message);
    res.status(500).json({
      message: "Failed to retrieve task",
    });
  }
}

// POST /api/tasks
// Create a new task
async function createTask(req, res) {
  try {
    const validation = validateTaskInput(req.body);
    if (validation.error) {
      return res.status(400).json({
        message: validation.error,
      });
    }

    const payload = {
      ...validation.data,
      createdBy: req.user ? req.user._id : undefined,
    };

    // If assignedTo is not specified, assign to creator by default
    if (!payload.assignedTo && req.user) {
      payload.assignedTo = req.user._id;
      payload.assignedToEmail = req.user.email;
    }

    const task = await Task.create(payload);

    // Emit real-time Socket.IO notification if available
    const io = req.app.get("io");
    if (io) {
      io.emit("task:created", {
        message: `New task added: "${task.title}"`,
        task: {
          _id: task._id,
          title: task.title,
          priority: task.priority,
          status: task.status,
          dueDate: task.dueDate,
          project: task.project,
        },
        createdAt: new Date(),
      });
    }

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.error("Error creating task:", error.message);
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid task data",
        error: error.message,
      });
    }
    res.status(500).json({
      message: "Failed to create task",
    });
  }
}

// PUT /api/tasks/:id
// Update a task (or complete it)
async function updateTask(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    const existingTask = await Task.findById(id);
    if (!existingTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Authorization: Admin or task creator/assignee can update
    if (
      req.user &&
      req.user.role !== "admin" &&
      existingTask.createdBy &&
      existingTask.createdBy.toString() !== req.user._id.toString() &&
      existingTask.assignedTo &&
      existingTask.assignedTo.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Access denied. You do not have permission to update this task.",
      });
    }

    // Partial or full update
    const updateData = {};
    if (req.body.title !== undefined) updateData.title = req.body.title.trim();
    if (req.body.description !== undefined) updateData.description = req.body.description.trim();
    if (req.body.priority !== undefined) updateData.priority = req.body.priority;
    if (req.body.status !== undefined) updateData.status = req.body.status;
    if (req.body.dueDate !== undefined) updateData.dueDate = req.body.dueDate;
    if (req.body.project !== undefined) updateData.project = req.body.project.trim();
    if (req.body.assignedTo !== undefined) updateData.assignedTo = req.body.assignedTo;
    if (req.body.assignedToEmail !== undefined) updateData.assignedToEmail = req.body.assignedToEmail;

    const task = await Task.findByIdAndUpdate(id, updateData, {
      returnDocument: "after",
      runValidators: true,
    });

    // Emit real-time Socket.IO notification if available
    const io = req.app.get("io");
    if (io) {
      io.emit("task:updated", {
        message: `Task updated: "${task.title}" (Status: ${task.status})`,
        task: {
          _id: task._id,
          title: task.title,
          priority: task.priority,
          status: task.status,
          dueDate: task.dueDate,
          project: task.project,
        },
        createdAt: new Date(),
      });
    }

    res.status(200).json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.error("Error updating task:", error.message);
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid task data",
        error: error.message,
      });
    }
    res.status(500).json({
      message: "Failed to update task",
    });
  }
}

// DELETE /api/tasks/:id
// Delete a task
async function deleteTask(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Role check: Admin or task creator can delete
    if (
      req.user &&
      req.user.role !== "admin" &&
      task.createdBy &&
      task.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Access denied. Admin or creator permission required.",
      });
    }

    await Task.findByIdAndDelete(id);

    // Emit real-time Socket.IO notification if available
    const io = req.app.get("io");
    if (io) {
      io.emit("task:deleted", {
        message: `Task removed: "${task.title}"`,
        task: {
          _id: task._id,
          title: task.title,
        },
        createdAt: new Date(),
      });
    }

    res.status(200).json({
      message: "Task deleted successfully",
      task,
    });
  } catch (error) {
    console.error("Error deleting task:", error.message);
    res.status(500).json({
      message: "Failed to delete task",
    });
  }
}

module.exports = {
  getTasks,
  getTaskStats,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
