const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const path = require('path');
require('dotenv').config(); 
const MongoStore = require('connect-mongo');
const session = require('express-session');
const connectDB = require('./configiration/database');

const app = express();
app.use(express.json()); // Or use body-parser's JSON parser
app.use(bodyParser.json()); // If using body-parser
app.use(express.urlencoded({ extended: true }));

// imports of routes
 const authentication = require ('./routers/authentication');
 const userdata = require ('./routers/userData');
 const userRoleRoutes = require ('./routers/userRolesRoute');
 const receptionForm = require ('./routers/receptionformRouter');
 




app.use(cors({
  origin: '*',
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true, 
}));

connectDB();

app.use(session({
  secret: 'kds-system-secret-key',
  resave: false,
  saveUninitialized: true,
  //store: MongoStore.create('mongodb://localhost:27017/kdsDatabase'),
  cookie: { secure: false } // Set to true in production with HTTPS
}));

//routers path api

 app.use('/api/authentication', authentication);
 app.use('/api/userdata', userdata);
 app.use('/api/roles', userRoleRoutes);
 app.use('/api/reception-form', receptionForm);


// router toggout 

// Logout route
app.post('/api/logout', (req, res) => {
  console.log('Logout request received');
  try {
    res.status(200).json({ message: 'Logged out successfully. Please delete your token on the client side.' });
  } catch (err) {
    console.error('Error during logout:', err); // Log the error
    res.status(500).json({ message: 'Server error during logout' });
  }
});

app.use('/photos', express.static(path.join(__dirname, 'photos')));

 const PORT = process.env.PORT || 5000;
 app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
 });
