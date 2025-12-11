import mongoose, { Types } from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model';
import Attempt from '../models/attempt.model';
import bcrypt from 'bcryptjs';

dotenv.config();

const usersToCreate = [
  { firstName: 'Test', lastName: 'Standard 1', email: 'test_std1@example.com', role: 'Standard', bciStatus: 'None' },
  { firstName: 'Test', lastName: 'Standard 2', email: 'test_std2@example.com', role: 'Standard', bciStatus: 'None' },
  { firstName: 'Test', lastName: 'Standard 3', email: 'test_std3@example.com', role: 'Standard', bciStatus: 'None' },
  { firstName: 'Test', lastName: 'Standard 4', email: 'test_std4@example.com', role: 'Standard', bciStatus: 'None' },
  { firstName: 'Test', lastName: 'Standard 5', email: 'test_std5@example.com', role: 'Standard', bciStatus: 'None' },
  { firstName: 'Test', lastName: 'BCI 1', email: 'test_bci1@example.com', role: 'BCI', bciStatus: 'Verified', bciCompany: 'Neuralink' },
  { firstName: 'Test', lastName: 'BCI 2', email: 'test_bci2@example.com', role: 'BCI', bciStatus: 'Verified', bciCompany: 'Precision' },
  { firstName: 'Test', lastName: 'BCI 3', email: 'test_bci3@example.com', role: 'BCI', bciStatus: 'Verified', bciCompany: 'Neuralink' },
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('🌱 Connected to MongoDB...');

    // I might implement if I want to wipe test users.
    // await User.deleteMany({ email: { $regex: /^test_/ } });
    // console.log('Old test users removed.');

    const createdUsers: (typeof User.prototype)[] = [];

    // Create Users
    console.log('Creating Users...');
    for (const userData of usersToCreate) {
      // Check if exists first to avoid duplicates
      let user = await User.findOne({ email: userData.email });

      if (!user) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        user = await User.create({
          ...userData,
          password: hashedPassword,
          createdAt: getRandomDate(90), // Joined sometime in last 90 days
        });
      }
      createdUsers.push(user);
    }

    // Create Attempts
    console.log('Creating Challenge Attempts...');
    const attempts = [];

    for (const user of createdUsers) {
      // Create 10-13 Reaction Time attempts
      const numReaction = 10 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numReaction; i++) {
        attempts.push(generateReactionTimeAttempt(user._id));
      }

      // Create 10-13 Line Tracing attempts
      const numLine = 10 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numLine; i++) {
        attempts.push(generateLineTracingAttempt(user._id));
      }
    }

    await Attempt.insertMany(attempts);
    console.log(`Successfully inserted ${attempts.length} attempts for ${createdUsers.length} users.`);

    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Get a random date within the last X days
function getRandomDate(daysBack: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  // Randomize time too
  date.setHours(Math.random() * 24, Math.random() * 60);
  return date;
}

function generateReactionTimeAttempt(userId: Types.ObjectId) {
  const isAdvanced = Math.random() > 0.7; // 30% chance of advanced
  const scoreBase = Math.floor(Math.random() * 3000) + 1000;
  const score = isAdvanced ? scoreBase * 1.5 : scoreBase;

  return {
    userId,
    challengeType: 'Reaction Time',
    score: Math.round(score),
    completionTime: 60,
    accuracy: 0.7 + (Math.random() * 0.3), // 70% - 100%
    ntpm: Math.floor(Math.random() * 20) + 30, // 30 - 50
    averageClickAccuracy: 0.6 + (Math.random() * 0.4), // 60% - 100%
    settings: {
      mode: isAdvanced ? 'Advanced' : 'Normal',
      speed: isAdvanced ? ['Normal', 'Medium', 'Fast'][Math.floor(Math.random() * 3)] : undefined
    },
    createdAt: getRandomDate(60) // Played sometime in last 60 days
  };
}

function generateLineTracingAttempt(userId: Types.ObjectId) {
  const isFail = Math.random() > 0.8; // 20% fail rate
  const progress = isFail ? Math.random() * 0.9 : 1; // 0-90% if fail, 100% if success

  return {
    userId,
    challengeType: 'Line Tracing',
    score: isFail ? 0 : Math.floor(Math.random() * 1500) + 1000,
    completionTime: Math.random() * 40 + 20, // 20-60 seconds
    accuracy: progress, // Use progress as accuracy for line tracing
    ntpm: Math.floor(Math.random() * 5), // Penalties (reused ntpm field)
    settings: {
      mode: 'Normal'
    },
    createdAt: getRandomDate(60)
  };
}

seedData();