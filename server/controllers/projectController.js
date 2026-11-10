const mongoose = require("mongoose");
const Project = require("../models/Project");

// GET /api/projects
async function getProjects(req, res) {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve projects" });
  }
}

// POST /api/projects
async function createProject(req, res) {
  try {
    const { name, description, status, progress, tasks } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Project name is required" });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ message: "Project description is required" });
    }

    const project = await Project.create({
      name: name.trim(),
      description: description.trim(),
      status: status || "Pending",
      progress: typeof progress === "number" ? progress : 0,
      tasks: typeof tasks === "number" ? tasks : 0,
      createdBy: req.user ? req.user._id : undefined,
    });

    res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create project" });
  }
}

// PUT /api/projects/:id
async function updateProject(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await Project.findByIdAndUpdate(id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update project" });
  }
}

// DELETE /api/projects/:id
async function deleteProject(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await Project.findByIdAndDelete(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({
      message: "Project deleted successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete project" });
  }
}

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
};
