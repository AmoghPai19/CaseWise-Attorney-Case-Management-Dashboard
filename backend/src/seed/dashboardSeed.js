/**
 * Populates the database with demo data for local development/testing.
 *
 * Usage:
 *   npm run seed
 *
 * Creates a demo Admin + two demo Attorney accounts if they don't already
 * exist (credentials logged at the end), then demo clients/cases/tasks,
 * with cases split across both attorneys and given a feeAmount so the
 * revenue dashboard has real numbers to show.
 */
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const Case = require('../models/Case');
const Task = require('../models/Task');
const Client = require('../models/Client');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/casewise';

const ADMIN_EMAIL = 'admin@casewise.demo';
const ADMIN_PASSWORD = 'ChangeMe123!';
const ATTORNEY_EMAIL = 'attorney@casewise.demo';
const ATTORNEY_PASSWORD = 'ChangeMe123!';
const ATTORNEY2_EMAIL = 'attorney2@casewise.demo';
const ATTORNEY2_PASSWORD = 'ChangeMe123!';

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomFee() {
  // Random fee between $500 and $15,000, rounded to the nearest $50.
  return Math.round((500 + Math.random() * 14500) / 50) * 50;
}

async function findOrCreateUser({ name, email, password, role }) {
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ name, email, password, role });
    console.log(`Created ${role} account: ${email}`);
  }
  return user;
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected for seeding');

    // ---------------------------------------------
    // USERS
    // ---------------------------------------------
    const adminUser = await findOrCreateUser({
      name: 'Demo Admin',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'Admin',
    });

    const attorneyUser = await findOrCreateUser({
      name: 'Demo Attorney',
      email: ATTORNEY_EMAIL,
      password: ATTORNEY_PASSWORD,
      role: 'Attorney',
    });

    const attorneyUser2 = await findOrCreateUser({
      name: 'Second Attorney',
      email: ATTORNEY2_EMAIL,
      password: ATTORNEY2_PASSWORD,
      role: 'Attorney',
    });

    const attorneys = [attorneyUser, attorneyUser2];

    // ---------------------------------------------
    // CLIENTS
    // ---------------------------------------------
    let clients = await Client.find();

    if (clients.length === 0) {
      console.log('Creating demo clients...');

      clients = await Client.insertMany([
        {
          name: 'Infosys Ltd',
          email: 'legal@infosys.com',
          phone: '9876543210',
          address: 'Bangalore',
          createdBy: adminUser._id,
        },
        {
          name: 'TCS Ltd',
          email: 'legal@tcs.com',
          phone: '9876543211',
          address: 'Mumbai',
          createdBy: adminUser._id,
        },
      ]);
    }

    // ---------------------------------------------
    // CASES
    // ---------------------------------------------
    const priorities = ['High', 'Medium', 'Low'];
    const statuses = ['Open', 'Pending', 'Closed'];

    const createdCases = [];
    const now = new Date();

    for (let i = 0; i < 40; i++) {
      const randomMonthOffset = Math.floor(Math.random() * 5);
      const randomDay = Math.floor(Math.random() * 28) + 1;

      const baseDate = new Date(
        now.getFullYear(),
        now.getMonth() - randomMonthOffset,
        randomDay
      );

      const randomClient = randomItem(clients);
      const randomAttorney = randomItem(attorneys);

      const newCase = await Case.create({
        title: `Demo Case ${Date.now()}-${i}`,
        description: 'Seeded demo case for dashboard visualization',
        clientId: randomClient._id,
        createdBy: adminUser._id,
        assignedAttorney: randomAttorney._id,
        priority: randomItem(priorities),
        status: randomItem(statuses),
        feeAmount: randomFee(),
        deadline: new Date(
          baseDate.getFullYear(),
          baseDate.getMonth(),
          randomDay + 7
        ),
        createdAt: baseDate,
      });

      createdCases.push(newCase);
    }

    console.log('Demo cases added.');

    // ---------------------------------------------
    // TASKS
    // ---------------------------------------------
    const taskStatuses = ['Open', 'In Progress', 'Completed', 'Overdue'];

    for (let i = 0; i < 30; i++) {
      const randomCase = randomItem(createdCases);
      const randomMonthOffset = Math.floor(Math.random() * 5);
      const randomDay = Math.floor(Math.random() * 28) + 1;

      await Task.create({
        title: `Demo Task ${Date.now()}-${i}`,
        status: randomItem(taskStatuses),
        dueDate: new Date(
          now.getFullYear(),
          now.getMonth() - randomMonthOffset,
          randomDay
        ),
        caseId: randomCase._id,
        // Keep the task's assignee consistent with who's actually on the case.
        assignedTo: randomCase.assignedAttorney,
      });
    }

    console.log('Demo tasks added.');
    console.log('Seeding complete.');
    console.log('---');
    console.log(`Admin login:      ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    console.log(`Attorney login:   ${ATTORNEY_EMAIL} / ${ATTORNEY_PASSWORD}`);
    console.log(`Attorney 2 login: ${ATTORNEY2_EMAIL} / ${ATTORNEY2_PASSWORD}`);

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:');
    console.error(err.message);
    process.exit(1);
  }
}

seed();
