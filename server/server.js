const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const projectRoutes = require("./routes/projectRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();
const allowedOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// Middleware
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json({ limit: "100kb" }));

// Root route
app.get("/", (req, res) => {
  res.status(200).send("TaskFlow API Running");
});

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", app: "TaskFlow" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", projectRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Create HTTP server for Express and Socket.IO
const server = http.createServer(app);

// Attach Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Handle real-time client connections
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", socket.id, reason);
  });
});

// Make Socket.IO instance accessible inside controllers
app.set("io", io);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
  } catch (dbErr) {
    console.warn("⚠️ Warning: MongoDB is not connected yet. Please update MONGODB_URI in server/.env with your MongoDB Atlas or local connection string.");
  }

  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();

module.exports = { app, server };
