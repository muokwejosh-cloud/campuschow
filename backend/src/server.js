const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const connectDB = require('./config/db');
const Order = require('./models/Order');
const MenuItem = require('./models/MenuItem');

connectDB();
const app = express();
const server = http.createServer(app);
app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '20kb' }));
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const clean = (value) => {
      if (typeof value === 'string') return value.trim().replace(/[<>]/g, '').slice(0, 2000);
      if (Array.isArray(value)) return value.map(clean);
      if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, clean(v)]));
      return value;
    };
    req.body = clean(req.body);
  }
  next();
});
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });
app.use('/api/auth', authLimiter);
const io = new Server(server, { cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST', 'PATCH'] } });
app.set('io', io);
const secret = () => process.env.JWT_SECRET || 'campuschow_secret_key_2026';
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    const claims = jwt.verify(token, secret());
    const user = await User.findById(claims.id).select('_id role');
    if (!user || user.role !== claims.role) return next(new Error('Unauthorized socket connection'));
    socket.data.user = { id: user._id.toString(), role: user.role };
    next();
  } catch { next(new Error('Unauthorized socket connection')); }
});
io.on('connection', socket => {
  socket.join(`user:${socket.data.user.id}`);
  if (socket.data.user.role === 'vendor') socket.join(`vendor:${socket.data.user.id}`);
});
function requireAuth(...roles) {
  return async (req, res, next) => {
    const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Authentication required.' });
    try {
      const claims = jwt.verify(token, secret());
      const account = await User.findById(claims.id).select('_id role phone');
      if (!account || account.role !== claims.role) return res.status(401).json({ message: 'Account is not available.' });
      req.user = { id: account._id.toString(), role: account.role, phone: account.phone };
      if (roles.length && !roles.includes(req.user.role)) return res.status(403).json({ message: 'You do not have access to this action.' });
      next();
    } catch { return res.status(401).json({ message: 'Invalid or expired token.' }); }
  };
}
const makeToken = () => `TOKEN #${['A', 'B', 'C', 'K'][Math.floor(Math.random() * 4)]}-${Math.floor(100 + Math.random() * 900)}`;
const publishOrder = order => {
  const ioServer = app.get('io');
  ioServer.to(`vendor:${order.vendorId}`).emit('new-order', order);
  ioServer.to(`user:${order.studentId}`).emit('order-created', order);
};
const orderFieldsValid = (body) => Array.isArray(body.items) && body.items.length > 0 && body.items.length <= 50 && body.items.every(i => typeof i.name === 'string' && i.name.length > 0 && Number.isFinite(Number(i.price)) && Number(i.price) >= 0 && Number(i.price) <= 1000000 && Number.isInteger(Number(i.quantity)) && Number(i.quantity) > 0 && Number(i.quantity) <= 50) && Number(body.totalAmount) > 0 && Math.round(body.items.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0) * 100) === Math.round(Number(body.totalAmount) * 100);
const combos = {
  '1': { name: 'Jollof Rice & Fried Chicken Combo', vendor: 'Jroyals', price: 2500 },
  '2': { name: 'Agege Bread & Fried Egg Combo', vendor: 'Chitis', price: 1700 },
  '3': { name: 'White Rice, Beans & Peppered Beef', vendor: 'Nuel Restaurants', price: 2500 },
  '4': { name: 'Pounded Yam & Egusi Delicacy', vendor: 'Local Delicacy', price: 2500 },
  '5': { name: 'Ewa agonyi and dodo', vendor: 'Nuel Restaurants', price: 1800 }
};
async function normalizeOrderItems(items, vendorId) {
  const vendor = await User.findOne({ _id: vendorId, role: 'vendor' }).select('kitchenName storeName');
  if (!vendor) return null;
  const kitchenName = vendor.kitchenName || vendor.storeName || '';
  const normalized = [];
  for (const item of items) {
    if (item.menuItemId) {
      const menuItem = await MenuItem.findOne({ _id: item.menuItemId, vendorId, isAvailable: true });
      if (!menuItem) return null;
      normalized.push({ menuItemId: menuItem._id, name: menuItem.name, price: menuItem.price, quantity: Number(item.quantity) });
      continue;
    }
    const combo = combos[String(item.comboId || '')];
    if (!combo || !kitchenName.toLowerCase().includes(combo.vendor.toLowerCase())) return null;
    normalized.push({ comboId: String(item.comboId), name: combo.name, price: combo.price, quantity: Number(item.quantity) });
  }
  return normalized;
}
app.get('/api', (req, res) => res.json({ message: 'CampusChow API & Queue Engine Running' }));

app.get('/api/vendors', async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor' }).select('kitchenName storeName campusLocation').sort({ kitchenName: 1 });
    res.json(vendors.map(vendor => ({ _id: vendor._id, kitchenName: vendor.kitchenName || vendor.storeName || 'Campus Kitchen', campusLocation: vendor.campusLocation || 'Campus' })));
  } catch { res.status(500).json({ message: 'Could not load kitchens.' }); }
});
app.get('/api/vendors/:vendorId/menu', async (req, res) => {
  try {
    const vendor = await User.findOne({ _id: req.params.vendorId, role: 'vendor' }).select('_id');
    if (!vendor) return res.status(404).json({ message: 'Kitchen not found.' });
    res.json(await MenuItem.find({ vendorId: vendor._id, isAvailable: true }).sort({ name: 1 }));
  } catch { res.status(400).json({ message: 'Could not load this kitchen menu.' }); }
});
app.get('/api/vendor/menu', requireAuth('vendor'), async (req, res) => {
  try { res.json(await MenuItem.find({ vendorId: req.user.id }).sort({ name: 1 })); }
  catch { res.status(500).json({ message: 'Could not load menu.' }); }
});
app.post('/api/vendor/menu', requireAuth('vendor'), async (req, res) => {
  try {
    const { name, price, description = '' } = req.body;
    if (!name || !Number.isFinite(Number(price)) || Number(price) <= 0 || description.length > 300) return res.status(400).json({ message: 'Enter a name, positive price, and description under 300 characters.' });
    const item = await MenuItem.create({ vendorId: req.user.id, name, price: Number(price), description, isAvailable: true });
    res.status(201).json(item);
  } catch { res.status(400).json({ message: 'Could not add menu item.' }); }
});
app.patch('/api/vendor/menu/:itemId', requireAuth('vendor'), async (req, res) => {
  try {
    const changes = {};
    if (typeof req.body.isAvailable === 'boolean') changes.isAvailable = req.body.isAvailable;
    if (req.body.name) changes.name = req.body.name;
    if (req.body.price !== undefined && Number(req.body.price) > 0) changes.price = Number(req.body.price);
    if (req.body.description !== undefined && req.body.description.length <= 300) changes.description = req.body.description;
    const item = await MenuItem.findOneAndUpdate({ _id: req.params.itemId, vendorId: req.user.id }, changes, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Menu item not found.' });
    res.json(item);
  } catch { res.status(400).json({ message: 'Could not update menu item.' }); }
});
app.get('/api/orders/mine', requireAuth('student'), async (req, res) => {
  try { res.json(await Order.find({ studentId: req.user.id }).populate('vendorId', 'kitchenName storeName campusLocation').sort({ createdAt: -1 }).limit(100)); }
  catch { res.status(500).json({ message: 'Could not load your orders.' }); }
});
app.get('/api/orders', requireAuth('vendor'), async (req, res) => {
  try {
    res.json(await Order.find({ vendorId: req.user.id }).populate('studentId', 'name phone').sort({ createdAt: -1 }));
  } catch (error) { res.status(500).json({ message: 'Could not load orders.' }); }
});
app.post('/api/orders', requireAuth('student'), async (req, res) => {
  try {
    const { items, totalAmount, notes, paymentMethod = 'pickup_cash', vendorId, referralCode } = req.body;
    if (!orderFieldsValid(req.body) || !['online', 'pickup_cash'].includes(paymentMethod) || !vendorId) return res.status(400).json({ message: 'Please provide valid pickup order details and kitchen.' });
    if (paymentMethod === 'online') return res.status(400).json({ message: 'Online orders must be submitted after payment verification.' });
    const verifiedItems = await normalizeOrderItems(items, vendorId);
    if (!verifiedItems) return res.status(400).json({ message: 'One or more items are unavailable in this kitchen.' });
    const verifiedTotal = verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (Math.round(verifiedTotal * 100) !== Math.round(Number(totalAmount) * 100)) return res.status(400).json({ message: 'Order total does not match the current menu prices.' });
    const order = await Order.create({ tokenNo: makeToken(), items: verifiedItems, totalAmount: verifiedTotal, notes, vendorId, studentId: req.user.id, customerPhone: req.user.phone, paymentMethod, paymentStatus: 'unpaid', referralCode, status: 'Pending' });
    publishOrder(order);
    res.status(201).json(await Order.findById(order._id).populate('vendorId', 'kitchenName storeName campusLocation'));
  } catch (error) { res.status(400).json({ message: 'Could not create order.' }); }
});
app.post('/api/orders/verify-payment', requireAuth('student'), async (req, res) => {
  try {
    const { reference, order: details } = req.body;
    if (!reference || !orderFieldsValid(details || {}) || !details.vendorId) return res.status(400).json({ message: 'Invalid payment or pickup order details.' });
    const verifiedItems = await normalizeOrderItems(details.items, details.vendorId);
    if (!verifiedItems) return res.status(400).json({ message: 'One or more items are unavailable in this kitchen.' });
    const verifiedTotal = verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (Math.round(verifiedTotal * 100) !== Math.round(Number(details.totalAmount) * 100)) return res.status(400).json({ message: 'Order total does not match the current menu prices.' });
    if (await Order.exists({ paymentReference: reference })) return res.status(409).json({ message: 'Payment reference has already been used.' });
    // Local demo references use DEMO-; production verification requires a Paystack secret key.
    let verified = /^DEMO-[A-Z0-9-]{6,}$/.test(reference);
    if (!verified && process.env.PAYSTACK_SECRET_KEY) {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } });
      const result = await response.json();
      verified = response.ok && result.status && result.data?.status === 'success' && Math.round(result.data.amount / 100) === Math.round(verifiedTotal);
    }
    if (!verified) return res.status(402).json({ message: 'Payment could not be verified.' });
    const order = await Order.create({ tokenNo: makeToken(), items: verifiedItems, totalAmount: verifiedTotal, notes: details.notes, vendorId: details.vendorId, studentId: req.user.id, customerPhone: req.user.phone, paymentMethod: 'online', paymentReference: reference, paymentStatus: 'paid', referralCode: details.referralCode, status: 'Pending' });
    publishOrder(order);
    res.status(201).json(await Order.findById(order._id).populate('vendorId', 'kitchenName storeName campusLocation'));
  } catch (error) { res.status(500).json({ message: 'Payment verification failed.' }); }
});
app.patch('/api/orders/:id/status', requireAuth('vendor'), async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findOne({ _id: req.params.id, vendorId: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    const allowedNext = { Pending: ['Preparing'], Preparing: ['Almost Ready', 'Ready'], 'Almost Ready': ['Ready'], Ready: ['Completed'], Completed: [] };
    if (!allowedNext[order.status]?.includes(status)) return res.status(400).json({ message: 'Order status transition is not allowed.' });
    if (status === 'Completed' && order.paymentStatus === 'unpaid') order.paymentStatus = 'paid';
    order.status = status;
    const saved = await order.save();
    req.app.get('io').to(`user:${saved.studentId}`).emit('order-status-updated', saved);
    req.app.get('io').to(`vendor:${saved.vendorId}`).emit('order-status-updated', saved);
    res.json(saved);
  } catch { res.status(400).json({ message: 'Could not update order.' }); }
});
app.patch('/api/orders/:id/picked-up', requireAuth('student'), async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, studentId: req.user.id, status: 'Ready' });
    if (!order) return res.status(404).json({ message: 'Ready pickup order not found.' });
    order.status = 'Completed'; order.paymentStatus = 'paid';
    const saved = await order.save(); req.app.get('io').to(`vendor:${saved.vendorId}`).emit('order-status-updated', saved); req.app.get('io').to(`user:${saved.studentId}`).emit('order-status-updated', saved); res.json(saved);
  } catch { res.status(400).json({ message: 'Could not confirm pickup.' }); }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, phone, password, role = 'student', storeName, kitchenName, campusLocation, email } = req.body;
    if (!name?.trim() || !/^\+?[0-9\s-]{7,18}$/.test(phone || '') || typeof password !== 'string' || password.length < 8 || !['student', 'vendor', 'agent'].includes(role) || (role === 'vendor' && (!kitchenName?.trim() || !campusLocation?.trim()))) return res.status(400).json({ message: 'Enter a name, valid phone, password (8+ characters), supported role, and kitchen details when registering as a vendor.' });
    if (await User.exists({ phone })) return res.status(409).json({ message: 'User with this phone number already exists.' });
    const data = { name: name.trim(), phone: phone.trim(), email, password: await bcrypt.hash(password, 12), role, storeName: role === 'vendor' ? (storeName || kitchenName) : undefined, kitchenName: role === 'vendor' ? kitchenName.trim() : undefined, campusLocation: role === 'vendor' ? campusLocation.trim() : undefined };
    if (role === 'agent') data.referralCode = `AGENT${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const user = await User.create(data);
    const token = jwt.sign({ id: user._id, role: user.role, phone: user.phone }, secret(), { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, phone: user.phone, email: user.email, role: user.role, storeName: user.storeName, kitchenName: user.kitchenName, campusLocation: user.campusLocation, referralCode: user.referralCode } });
  } catch { res.status(400).json({ message: 'Could not create account.' }); }
});
app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ message: 'Phone and password are required.' });
    const user = await User.findOne({ phone });
    if (!user || !['student', 'vendor', 'agent'].includes(user.role) || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Invalid phone or password.' });
    const token = jwt.sign({ id: user._id, role: user.role, phone: user.phone }, secret(), { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, phone: user.phone, email: user.email, role: user.role, storeName: user.storeName, kitchenName: user.kitchenName, campusLocation: user.campusLocation, referralCode: user.referralCode } });
  } catch { res.status(500).json({ message: 'Could not sign in.' }); }
});
app.get('/api/agent/summary', requireAuth('agent'), async (req, res) => {
  const user = await User.findById(req.user.id).select('referralCode');
  const orders = await Order.find({ referralCode: user.referralCode }).select('totalAmount createdAt');
  res.json({ referralCode: user.referralCode, orders: orders.length, commission: orders.reduce((sum, order) => sum + order.totalAmount * 0.05, 0) });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 CampusChow Server running on http://localhost:${PORT}`));
