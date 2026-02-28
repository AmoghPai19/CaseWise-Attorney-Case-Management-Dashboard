const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

const Case = require("../models/Case");
const Task = require("../models/Task");
const Client = require("../models/Client");
const User = require("../models/User");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/casewise";

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected for seeding");

    // ---------------------------------------------
    // USERS
    // ---------------------------------------------
    // ---------------------------------------------
// USE YOUR EXISTING ATTORNEY ACCOUNT
    // ---------------------------------------------

    const myEmail = "amoghp909@gmail.com"; // <-- Put your login email

    const attorneyUser = await User.findOne({ email: myEmail });

    if (!attorneyUser) {
      console.log("❌ Attorney account not found. Update email in seed file.");
      process.exit(1);
    }

    // If you also need createdBy field (Admin required in schema)
    let adminUser = await User.findOne({ role: "Admin" });

    // If no admin exists, use your attorney account
    if (!adminUser) {
      adminUser = attorneyUser;
    }

    // ---------------------------------------------
    // CLIENTS
    // ---------------------------------------------
    let clients = await Client.find();

    if (clients.length === 0) {
      console.log("Creating demo clients...");

      clients = await Client.insertMany([
        {
          name: "Infosys Ltd",
          email: "legal@infosys.com",
          phone: "9876543210",
          address: "Bangalore",
          createdBy: adminUser._id,
        },
        {
          name: "TCS Ltd",
          email: "legal@tcs.com",
          phone: "9876543211",
          address: "Mumbai",
          createdBy: adminUser._id,
        },
      ]);
    }

    // ---------------------------------------------
    // CASES (FIXED DATE LOGIC ONLY)
    // ---------------------------------------------
    const priorities = ["High", "Medium", "Low"];
    const statuses = ["Open", "Pending", "Closed"];

    const createdCases = [];
    const now = new Date();

    for (let i = 0; i < 40; i++) {
      // Random month within last 5 months
      const randomMonthOffset = Math.floor(Math.random() * 5);
      const randomDay = Math.floor(Math.random() * 28) + 1;

      const baseDate = new Date(
        now.getFullYear(),
        now.getMonth() - randomMonthOffset,
        randomDay
      );

      const priorityRand = Math.random();
      let priority;

      if (priorityRand < 0.2) priority = "High";
      else if (priorityRand < 0.7) priority = "Medium";
      else priority = "Low";

      const randomClient =
        clients[Math.floor(Math.random() * clients.length)];

      const newCase = await Case.create({
        title: `Demo Case ${Date.now()}-${i}`,
        description: "Seeded demo case for dashboard visualization",
        clientId: randomClient._id,
        createdBy: adminUser._id,
        assignedAttorney: attorneyUser._id,
        priority,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        deadline: new Date(
          baseDate.getFullYear(),
          baseDate.getMonth(),
          randomDay + 7
        ),
        createdAt: baseDate,
      });

      createdCases.push(newCase);
    }

    console.log("Demo cases added.");

    // ---------------------------------------------
    // TASKS (ONLY DATE UPDATED)
    // ---------------------------------------------
    const categories = ["Litigation", "Corporate", "Compliance"];

    for (let i = 0; i < 30; i++) {
      const randomCase =
        createdCases[Math.floor(Math.random() * createdCases.length)];

      const randomMonthOffset = Math.floor(Math.random() * 5);
      const randomDay = Math.floor(Math.random() * 28) + 1;

      await Task.create({
        title: `Demo Task ${Date.now()}-${i}`,
        category:
          categories[Math.floor(Math.random() * categories.length)],
        completed: Math.random() > 0.4,
        dueDate: new Date(
          now.getFullYear(),
          now.getMonth() - randomMonthOffset,
          randomDay
        ),
        caseId: randomCase._id,
        assignedTo: attorneyUser._id,
      });
    }

    console.log("Demo tasks added.");
    console.log("Seeding complete ✅");

    process.exit();
  } catch (err) {
    console.error("Seeding failed:");
    console.error(err.message);
    process.exit(1);
  }
}

seed();