const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

const User = require('./models/User');
const Category = require('./models/Category');
const Quote = require('./models/Quote');

const seed = async () => {
  try {
    await connectDB();

    await User.deleteMany({});
    await Category.deleteMany({});
    await Quote.deleteMany({});

    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@merabachamerishan.com',
      password: 'Admin@123',
      role: 'superadmin',
      isVerified: true,
    });
    console.log('Admin created:', admin.email);

    const categoryData = [
      { name: 'Alphabet', type: 'student', description: 'Learn alphabets', order: 1 },
      { name: 'Numbers', type: 'student', description: 'Learn numbers', order: 2 },
      { name: 'Science', type: 'student', description: 'Science experiments and facts', order: 3 },
      { name: 'Mathematics', type: 'student', description: 'Math concepts', order: 4 },
      { name: 'Stories', type: 'student', description: 'Educational stories', order: 5 },
      { name: 'Rhymes', type: 'student', description: 'Nursery rhymes', order: 6 },
      { name: 'General Knowledge', type: 'student', description: 'GK for kids', order: 7 },
      { name: 'Moral Values', type: 'student', description: 'Moral education', order: 8 },
      { name: 'Art and Craft', type: 'student', description: 'Creative activities', order: 9 },
      { name: 'Parenting Tips', type: 'parent', description: 'Parenting guidance', order: 10 },
      { name: 'Child Psychology', type: 'parent', description: 'Understanding child behavior', order: 11 },
      { name: 'Nutrition', type: 'parent', description: 'Healthy eating for kids', order: 12 },
      { name: 'Health', type: 'parent', description: 'Child health and wellness', order: 13 },
      { name: 'Community Events', type: 'community', description: 'Community happenings', order: 14 },
      { name: 'Workshops', type: 'community', description: 'Educational workshops', order: 15 },
    ].map(c => ({ ...c, slug: c.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }));
    const categories = await Category.insertMany(categoryData);
    console.log(`${categories.length} categories created`);

    const quotes = await Quote.insertMany([
      { content: 'Education is the most powerful weapon which you can use to change the world.', author: 'Nelson Mandela', isActive: true, isDaily: true },
      { content: 'Every child is a different kind of flower, and all together make this world a beautiful garden.', author: 'Unknown', isActive: true, isDaily: true },
      { content: 'The beautiful thing about learning is that nobody can take it away from you.', author: 'B.B. King', isActive: true, isDaily: true },
      { content: 'Children are not things to be molded, but people to be unfolded.', author: 'Jess Lair', isActive: true, isDaily: true },
      { content: 'Tell me and I forget. Teach me and I remember. Involve me and I learn.', author: 'Benjamin Franklin', isActive: true, isDaily: true },
    ]);
    console.log(`${quotes.length} quotes created`);

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
