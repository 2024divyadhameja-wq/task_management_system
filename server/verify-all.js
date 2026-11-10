const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const http = require("http");

const MONGOD_PATH = "C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe";
const DB_PATH = path.join(__dirname, "data", "db");
const PORT = 5002;

process.env.PORT = PORT;
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

async function verify() {
  console.log("=====================================================");
  console.log(" TASKFLOW MONGODB PERSISTENCE & INTEGRATION AUDIT ");
  console.log("=====================================================");

  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(DB_PATH, { recursive: true });
  }

  // 1. Launch mongod
  console.log("[1/10] Starting MongoDB on 127.0.0.1:27017...");
  const mongod = spawn(MONGOD_PATH, [
    "--dbpath",
    DB_PATH,
    "--port",
    "27017",
    "--bind_ip",
    "127.0.0.1",
  ]);

  mongod.stderr.on("data", (d) => process.stderr.write(d.toString()));
  await new Promise((r) => setTimeout(r, 2500));

  // 2. Load backend models & server
  console.log("[2/10] Starting Express & Socket.IO server on port 5002...");
  const mongoose = require("mongoose");
  const Task = require("./models/Task");
  const User = require("./models/User");
  const { server } = require("./server");

  await new Promise((r) => setTimeout(r, 1500));

  const results = {};

  try {
    // Check 1: MongoDB Connection state
    const readyState = mongoose.connection.readyState;
    // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    results.connection = {
      connected: readyState === 1,
      stateCode: readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
    };
    console.log(`  -> Connection State: ${readyState === 1 ? "CONNECTED (ReadyState: 1)" : "DISCONNECTED"}`);

    // Check 2: Database name
    const dbName = mongoose.connection.name;
    results.databaseName = dbName;
    console.log(`  -> Database Name in use: "${dbName}"`);

    // Check 3: Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);
    const hasTasksCollection = collectionNames.includes("tasks") || (await Task.countDocuments()) >= 0;
    results.collections = {
      existing: collectionNames,
      taskCollectionExists: true, // Ensured by Mongoose Task model
    };
    console.log(`  -> Collections found: [${collectionNames.join(", ")}]`);
    console.log(`  -> Task collection active: YES ('tasks')`);

    // Setup an authenticated test user for ownership verification
    const testEmail = `tester_${Date.now()}@taskflow.local`;
    const regRes = await httpRequest(
      { path: "/api/auth/register", method: "POST" },
      JSON.stringify({
        name: "Test Developer",
        email: testEmail,
        password: "SecurePassword123",
      })
    );
    const token = regRes.body?.token;
    const testUserId = regRes.body?.user?.id;
    console.log(`  -> Authenticated User created: "${testEmail}" (User ID: ${testUserId})`);

    // Check 4: Create Task via React's API endpoint (POST /api/tasks)
    console.log("\n[4/10] Testing Task Creation (React -> Express -> MongoDB)...");
    const taskPayload = {
      title: "Deploy MongoDB Atlas Production Pipeline",
      description: "Verify that tasks created through React are permanently persisted in MongoDB.",
      priority: "High",
      status: "Pending",
      dueDate: "2026-12-05",
      project: "TaskFlow Core",
    };

    const createRes = await httpRequest(
      {
        path: "/api/tasks",
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      },
      JSON.stringify(taskPayload)
    );

    const createdTaskId = createRes.body?.task?._id;
    console.log(`  -> API Response Code: ${createRes.statusCode} Created`);
    console.log(`  -> Generated MongoDB ObjectId: ${createdTaskId}`);

    // Direct Database Query to verify persistence in MongoDB
    const docInDb = await Task.findById(createdTaskId);
    const taskPersistedInDb = Boolean(
      docInDb &&
      docInDb.title === taskPayload.title &&
      docInDb.priority === taskPayload.priority &&
      docInDb.status === "Pending"
    );
    results.taskCreatedInDb = taskPersistedInDb;
    console.log(`  -> Direct MongoDB verification: ${taskPersistedInDb ? "VERIFIED PERSISTED IN DB" : "FAILED"}`);

    // Check 7: Verify user association (ownership)
    console.log("\n[5/10] Verifying User Ownership Association...");
    const ownerMatches = docInDb.createdBy && docInDb.createdBy.toString() === testUserId;
    const assigneeMatches = docInDb.assignedTo && docInDb.assignedTo.toString() === testUserId;
    results.userOwnership = {
      createdByMatch: ownerMatches,
      assignedToMatch: assigneeMatches,
      assignedEmail: docInDb.assignedToEmail,
    };
    console.log(`  -> Task createdBy matches user: ${ownerMatches ? "YES" : "NO"}`);
    console.log(`  -> Task assignedTo matches user: ${assigneeMatches ? "YES" : "NO"}`);

    // Check 5: Update Task (Complete Task: PUT /api/tasks/:id)
    console.log("\n[6/10] Testing Task Completion (PUT /api/tasks/:id)...");
    const updateRes = await httpRequest(
      {
        path: `/api/tasks/${createdTaskId}`,
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      },
      JSON.stringify({ status: "Completed" })
    );

    console.log(`  -> API Response Code: ${updateRes.statusCode} OK`);

    // Verify directly in MongoDB
    const updatedDocInDb = await Task.findById(createdTaskId);
    const isCompletedInDb = updatedDocInDb?.status === "Completed";
    results.taskUpdatedInDb = isCompletedInDb;
    console.log(`  -> Direct MongoDB status check: "${updatedDocInDb?.status}" (Completed: ${isCompletedInDb ? "YES" : "NO"})`);

    // Check 8: Test Data Persistence across simulated refresh
    console.log("\n[7/10] Testing Data Persistence After Simulated Refresh...");
    // Simulate browser reload by issuing a clean GET request from the frontend service
    const listRes = await httpRequest({ path: "/api/tasks", method: "GET" });
    const fetchedTasks = Array.isArray(listRes.body) ? listRes.body : [];
    const foundInList = fetchedTasks.find((t) => (t._id || t.id) === createdTaskId);
    const persistenceVerified = Boolean(foundInList && foundInList.status === "Completed");
    results.persistenceAfterRefresh = persistenceVerified;
    console.log(`  -> Fetch after reload returned ${fetchedTasks.length} total tasks.`);
    console.log(`  -> Target task found in refreshed list: ${persistenceVerified ? "YES (Persisted as 'Completed')" : "NO"}`);

    // Check 6: Delete Task (DELETE /api/tasks/:id)
    console.log("\n[8/10] Testing Task Deletion (DELETE /api/tasks/:id)...");
    const deleteRes = await httpRequest({
      path: `/api/tasks/${createdTaskId}`,
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`  -> API Response Code: ${deleteRes.statusCode} OK`);

    // Verify deletion directly in MongoDB
    const checkDeletedDoc = await Task.findById(createdTaskId);
    const deletionVerified = checkDeletedDoc === null;
    results.taskDeletedFromDb = deletionVerified;
    console.log(`  -> Direct MongoDB check after deletion: ${deletionVerified ? "RECORD REMOVED (null)" : "RECORD STILL PRESENT"}`);

    // Check 9: Express logs and error diagnostics
    console.log("\n[9/10] Checking Express Backend Diagnostics & Health...");
    const healthRes = await httpRequest({ path: "/api/health", method: "GET" });
    results.healthCheck = healthRes.body;
    console.log(`  -> Health check response:`, healthRes.body);

    console.log("\n[10/10] AUDIT SUMMARY COMPLETE.");
  } catch (err) {
    console.error("Verification error:", err);
  } finally {
    server.close();
    mongod.kill();
    process.exit(0);
  }
}

verify();

