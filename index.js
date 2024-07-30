const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const authRoutes = require('./routes/auth');
const resetRoutes = require('./routes/reset')
const productRoute = require('./routes/product');
const categoryRoute = require('./routes/category');
const cartRoute = require('./routes/cart');

const app = express();

db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Serve static files from the 'Uploads' directory
const uploadsPath = '/home/dev/Arun/E-Commerce/Back_end/uploads'; // Adjust the path as per your actual setup


app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/uploads', express.static(uploadsPath)); 

app.use('/api/auth', authRoutes);
app.use('/api/reset',resetRoutes);
app.use('/api/product',productRoute);
app.use('/api/category',categoryRoute);
app.use('/api/cart',cartRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
