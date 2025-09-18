const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();

const User = require('./models/User');

const app = express();
const PORT = 3000;
const MONGO_URI = process.env.MONGO_URI;

// --- Connect to MongoDB ---
const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB Connected...');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1);
    }
};
connectDB();

// --- Middleware ---
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: 'a_very_secret_key_for_greensense',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGO_URI })
}));

// --- Routes ---
app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Backend validation for register route
        if (!name || !email || !password) {
            return res.redirect('/register.html?error=empty');
        }

        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.redirect('/register.html?error=exists');
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        res.redirect('/login.html');
    } catch (err) {
        console.error(err);
        res.redirect('/register.html?error=server');
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Backend validation for empty fields
        if (!email || !password) {
            return res.redirect('/login.html?error=empty');
        }

        const user = await User.findOne({ email: email });
        if (!user) {
            return res.redirect('/login.html?error=invalid');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.redirect('/login.html?error=invalid');
        }
        req.session.userId = user._id;
        req.session.userName = user.name;
        res.redirect('/dashboard.html');

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error during login.');
    }
});

app.get('/dashboard', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login.html');
    }
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/api/user', (req, res) => {
    if (req.session.userId) {
        res.json({ name: req.session.userName });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/dashboard.html');
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

// --- Server Listening ---
app.listen(PORT, () => {
    console.log(`🌳 GreenSense server is live at http://localhost:${PORT}`);
});