const { spawn } = require("child_process");
const http = require("http");
const path = require("path");
const fs = require("fs");

const MONGOD_PATH = "C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe";
const DB_PATH = path.join(__dirname, "data", "db");
const PORT = 5005;

process.env.PORT = PORT;
process.env.MONGODB_URI = "mongodb://127.0.0.1:27018/taskflow_test";
process.env.JWT_SECRET = "test_jwt_secret_1234567890_abcdefghij";
process.env.CLIENT_ORIGIN = "http://localhost:5173";

// Helper for HTTP requests
function httpRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: PORT,
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(postData ? { "Content-Length": Buffer.byteLength(postData) } : {}),
          ...options.headers,
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: body ? JSON.parse(body) : {},
              rawBody: body,
            });
          } catch {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              rawBody: body,
            });
          }
        });
      }
    );

    req.on("error", reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log("=== STARTING TASKFLOW INTEGRATION TEST SUITE ===");

  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(DB_PATH, { recursive: true });
  }

  // 1. Start mongod
  console.log("1. Starting test mongod on port 27018...");
  const mongod = spawn(MONGOD_PATH, [
    "--dbpath",
    DB_PATH,
    "--port",
    "27018",
    "--bind_ip",
    "127.0.0.1",
  ]);

  mongod.stderr.on("data", (d) => process.stderr.write(d.toString()));

  // Wait 2.5s for mongod to bind
  await new Promise((r) => setTimeout(r, 2500));

  // 2. Start Express & Socket.IO server
  console.log("2. Starting Express & Socket.IO server on port 5005...");
  const { app, server } = require("./server");

  // Wait 1s for server listen
  await new Promise((r) => setTimeout(r, 1000));

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, extraInfo = "") {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${extraInfo}`);
      failed++;
    }
  }

  try {
    // Test A: Root endpoint
    console.log("\n--- TEST PHASE 1: Health & Root ---");
    const rootRes = await httpRequest({ path: "/", method: "GET" });
    assert(rootRes.statusCode === 200, "GET / returns 200", rootRes.rawBody);
    assert(
      rootRes.rawBody.includes("TaskFlow API Running"),
      "GET / body says 'TaskFlow API Running'"
    );

    const healthRes = await httpRequest({ path: "/api/health", method: "GET" });
    assert(healthRes.statusCode === 200, "GET /api/health returns 200");
    assert(healthRes.body?.status === "ok", "GET /api/health status is 'ok'");

    // Test B: Auth Registration
    console.log("\n--- TEST PHASE 2: JWT Authentication & User Model ---");
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    const regPayload = JSON.stringify({
      name: "Divya Tester",
      email: uniqueEmail,
      password: "Password123",
    });

    const regRes = await httpRequest(
      { path: "/api/auth/register", method: "POST" },
      regPayload
    );
    assert(regRes.statusCode === 201, "POST /api/auth/register returns 201 Created");
    assert(Boolean(regRes.body?.token), "Register returns JWT token");
    assert(regRes.body?.user?.email === uniqueEmail, "Register returns user profile");
    assert(regRes.body?.user?.role === "user", "Default registered role is 'user'");

    const token = regRes.body?.token;

    // Test Duplicate Registration
    const dupRes = await httpRequest(
      { path: "/api/auth/register", method: "POST" },
      regPayload
    );
    assert(dupRes.statusCode === 409, "Duplicate registration returns 409 Conflict");

    // Test Registration with short password
    const shortPassRes = await httpRequest(
      { path: "/api/auth/register", method: "POST" },
      JSON.stringify({
        name: "Shorty",
        email: `short_${Date.now()}@test.com`,
        password: "123",
      })
    );
    assert(shortPassRes.statusCode === 400, "Short password returns 400 Bad Request");

    // Test Login
    const loginRes = await httpRequest(
      { path: "/api/auth/login", method: "POST" },
      JSON.stringify({ email: uniqueEmail, password: "Password123" })
    );
    assert(loginRes.statusCode === 200, "POST /api/auth/login returns 200 OK");
    assert(Boolean(loginRes.body?.token), "Login returns JWT token");

    // Test Login with bad password
    const badLoginRes = await httpRequest(
      { path: "/api/auth/login", method: "POST" },
      JSON.stringify({ email: uniqueEmail, password: "WrongPassword" })
    );
    assert(badLoginRes.statusCode === 401, "Invalid password returns 401 Unauthorized");

    // Test Profile (/me)
    const meRes = await httpRequest({
      path: "/api/auth/me",
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(meRes.statusCode === 200, "GET /api/auth/me with Bearer token returns 200");
    assert(meRes.body?.user?.name === "Divya Tester", "GET /api/auth/me returns current user");

    // Test Profile without token
    const noTokenMeRes = await httpRequest({ path: "/api/auth/me", method: "GET" });
    assert(noTokenMeRes.statusCode === 401, "GET /api/auth/me without token returns 401");

    // Test C: Tasks REST CRUD
    console.log("\n--- TEST PHASE 3: Task REST API & Mongoose Persistence ---");

    // Create task unauthenticated
    const unauthTaskRes = await httpRequest(
      { path: "/api/tasks", method: "POST" },
      JSON.stringify({
        title: "Unauth Task",
        description: "Should fail",
        dueDate: "2026-12-01",
      })
    );
    assert(unauthTaskRes.statusCode === 401, "POST /api/tasks without token returns 401");

    // Create valid task
    const taskPayload = JSON.stringify({
      title: "Complete FSD Project Continuation",
      description: "Implement pages 76-140 adapting EventHub to TaskFlow",
      priority: "High",
      status: "In Progress",
      dueDate: "2026-11-15",
      project: "Task Management System",
    });

    const createTaskRes = await httpRequest(
      {
        path: "/api/tasks",
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      },
      taskPayload
    );
    assert(createTaskRes.statusCode === 201, "POST /api/tasks returns 201 Created");
    assert(Boolean(createTaskRes.body?.task?._id), "Created task has valid MongoDB _id");
    assert(createTaskRes.body?.task?.priority === "High", "Task has correct priority 'High'");

    const createdTaskId = createTaskRes.body?.task?._id;

    // Get all tasks
    const getTasksRes = await httpRequest({ path: "/api/tasks", method: "GET" });
    assert(getTasksRes.statusCode === 200, "GET /api/tasks returns 200 OK");
    assert(Array.isArray(getTasksRes.body), "GET /api/tasks returns array");
    assert(getTasksRes.body.length >= 1, "Task list includes created task");

    // Get single task by ID
    const getSingleRes = await httpRequest({
      path: `/api/tasks/${createdTaskId}`,
      method: "GET",
    });
    assert(getSingleRes.statusCode === 200, "GET /api/tasks/:id returns 200 OK");
    assert(
      getSingleRes.body?.title === "Complete FSD Project Continuation",
      "GET /api/tasks/:id returns correct task details"
    );

    // Update task
    const updateRes = await httpRequest(
      {
        path: `/api/tasks/${createdTaskId}`,
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      },
      JSON.stringify({ status: "Completed" })
    );
    assert(updateRes.statusCode === 200, "PUT /api/tasks/:id returns 200 OK");
    assert(updateRes.body?.task?.status === "Completed", "Task status updated to 'Completed'");

    // Get task stats
    const statsRes = await httpRequest({
      path: "/api/tasks/stats/summary",
      method: "GET",
    });
    assert(statsRes.statusCode === 200, "GET /api/tasks/stats/summary returns 200");
    assert(statsRes.body?.totalTasks >= 1, "Stats totalTasks >= 1");
    assert(statsRes.body?.completedTasks >= 1, "Stats completedTasks >= 1");

    // Test Delete Task
    const deleteRes = await httpRequest({
      path: `/api/tasks/${createdTaskId}`,
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(deleteRes.statusCode === 200, "DELETE /api/tasks/:id returns 200 OK");

    // Verify deletion
    const verifyDelRes = await httpRequest({
      path: `/api/tasks/${createdTaskId}`,
      method: "GET",
    });
    assert(verifyDelRes.statusCode === 404, "Deleted task returns 404 Not Found");

    // Test D: Socket.IO verification
    console.log("\n--- TEST PHASE 4: Real-time Socket.IO Connection ---");
    const { io: ioClient } = require("../client/node_modules/socket.io-client");
    const clientSocket = ioClient(`http://localhost:${PORT}`, {
      transports: ["websocket", "polling"],
    });

    let socketConnected = false;
    await new Promise((resolve) => {
      clientSocket.on("connect", () => {
        socketConnected = true;
        resolve();
      });
      setTimeout(resolve, 2000);
    });

    assert(socketConnected, "Socket.IO client successfully connects to backend");
    clientSocket.disconnect();
  } catch (err) {
    console.error("Test execution error:", err);
    failed++;
  } finally {
    console.log(`\n==============================================`);
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`==============================================\n`);

    // Clean up
    server.close();
    mongod.kill();
    process.exit(failed === 0 ? 0 : 1);
  }
}

runTests();

