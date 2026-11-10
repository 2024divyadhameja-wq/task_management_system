const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Task = require("./models/Task");
const Project = require("./models/Project");

async function seedData() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/taskflow";
  console.log("Connecting to MongoDB for seeding:", uri);

  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");

    // Clear existing data
    await User.deleteMany({});
    await Task.deleteMany({});
    await Project.deleteMany({});
    console.log("Cleared existing collections.");

    // Create Admin User
    const adminPasswordHash = await bcrypt.hash("AdminPass123", 12);
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@taskflow.com",
      password: adminPasswordHash,
      role: "admin",
    });

    // Create Normal User
    const userPasswordHash = await bcrypt.hash("UserPass123", 12);
    const normalUser = await User.create({
      name: "Divya Dhameja",
      email: "divya@taskflow.com",
      password: userPasswordHash,
      role: "user",
    });

    console.log("Created users:");
    console.log("  - Admin:  admin@taskflow.com  / AdminPass123");
    console.log("  - User:   divya@taskflow.com  / UserPass123");

    // Create Projects
    const projects = await Project.insertMany([
      {
        name: "Task Management System",
        description: "Develop a complete task management application using React, Express, MongoDB and Socket.IO.",
        status: "In Progress",
        tasks: 4,
        progress: 75,
        createdBy: adminUser._id,
      },
      {
        name: "College FSD Submission",
        description: "Prepare project documentation, test cases, and presentation slides for final FSD evaluation.",
        status: "In Progress",
        tasks: 2,
        progress: 50,
        createdBy: normalUser._id,
      },
      {
        name: "Personal Portfolio",
        description: "Showcase Full Stack projects, skills, and certifications in modern responsive UI.",
        status: "Pending",
        tasks: 3,
        progress: 25,
        createdBy: normalUser._id,
      },
    ]);
    console.log(`Created ${projects.length} sample projects.`);

    // Create Tasks
    const tasks = await Task.insertMany([
      {
        title: "Complete Full Stack Assignment",
        description: "Develop the frontend and backend components of the task management system with real-time updates.",
        priority: "High",
        status: "In Progress",
        dueDate: "2026-11-25",
        project: "Task Management System",
        createdBy: adminUser._id,
        assignedTo: normalUser._id,
        assignedToEmail: normalUser.email,
      },
      {
        title: "Design MongoDB Database Schemas",
        description: "Define Mongoose collections for users, tasks, and projects with proper validation and relationships.",
        priority: "Medium",
        status: "Completed",
        dueDate: "2026-11-20",
        project: "Task Management System",
        createdBy: adminUser._id,
        assignedTo: normalUser._id,
        assignedToEmail: normalUser.email,
      },
      {
        title: "Implement JWT Authentication & RBAC",
        description: "Secure API endpoints with token verification, bcrypt hashing, and admin role restrictions.",
        priority: "High",
        status: "Completed",
        dueDate: "2026-11-22",
        project: "Task Management System",
        createdBy: adminUser._id,
        assignedTo: adminUser._id,
        assignedToEmail: adminUser.email,
      },
      {
        title: "Real-time Socket.IO Notifications",
        description: "Emit events on task creation, update, and deletion, and display dynamic alerts in NotificationBell.",
        priority: "Medium",
        status: "Completed",
        dueDate: "2026-11-24",
        project: "Task Management System",
        createdBy: adminUser._id,
        assignedTo: normalUser._id,
        assignedToEmail: normalUser.email,
      },
      {
        title: "Prepare Project Documentation & Viva Slides",
        description: "Draft comprehensive documentation covering REST architecture, Mongoose schemas, and testing evidence.",
        priority: "Low",
        status: "Pending",
        dueDate: "2026-11-30",
        project: "College FSD Submission",
        createdBy: normalUser._id,
        assignedTo: normalUser._id,
        assignedToEmail: normalUser.email,
      },
    ]);
    console.log(`Created ${tasks.length} sample tasks.`);

    console.log("\n✅ Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error.message);
    process.exit(1);
  }
}

seedData();

