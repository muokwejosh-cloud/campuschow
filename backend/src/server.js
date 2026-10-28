const FoodItem = require('./models/FoodItem');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const Order = require('./models/Order');

connectDB();

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`⚡ Connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`🔌 Disconnected: ${socket.id}`);
  });
});

app.get('/api', (req, res) => {
  res.json({ message: 'CampusChow API & Queue Engine Running' });
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { tokenNo, items, totalAmount, notes } = req.body;
    const newOrder = new Order({
      tokenNo,
      items,
      totalAmount,
      notes,
      status: 'Pending'
    });
    const savedOrder = await newOrder.save();
    io.emit('newOrder', savedOrder);
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    io.emit('orderStatusUpdated', updatedOrder);
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ================= AUTHENTICATION ROUTES =================

// Register Route (Student or Vendor)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, phone, password, role, storeName } = req.body;

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this phone number already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      phone,
      password: hashedPassword,
      role: role || 'student',
      storeName: role === 'vendor' ? storeName : undefined
    });

    const savedUser = await newUser.save();

    const token = jwt.sign(
      { id: savedUser._id, role: savedUser.role },
      process.env.JWT_SECRET || 'campuschow_secret_key_2026',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        phone: savedUser.phone,
        role: savedUser.role,
        storeName: savedUser.storeName
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone, password, role } = req.body;

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: 'Account not found with this phone number.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'campuschow_secret_key_2026',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        storeName: user.storeName
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= MENU ITEM ROUTES =================

// Fetch all available dishes
app.get('/api/menu', async (req, res) => {
  try {
    const items = await FoodItem.find({});
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving menu items', error: error.message });
  }
});

// Toggle stock status (Vendor action)
app.patch('/api/menu/:id/toggle-stock', async (req, res) => {
  try {
    const item = await FoodItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    item.inStock = !item.inStock;
    const updated = await item.save();

    // Broadcast inventory change in real-time
    io.emit('stockUpdated', updated);

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update stock', error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 CampusChow Server running on http://localhost:${PORT}`);
});