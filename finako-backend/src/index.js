require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- DATABASE SEMENTARA (DUMMY) ---
let dummyProducts = [
    { id: 1, name: 'Kopi Susu Gula Aren', price: 18000 },
    { id: 2, name: 'Croissant Cokelat', price: 15000 },
];
let nextProductId = 3;

let dummyCategories = [
    { id: 1, name: 'Gaji' }, { id: 2, name: 'Sewa' },
];
let nextCategoryId = 3;

// --- API ENDPOINTS ---
app.get('/', (req, res) => {
  res.send('Server Backend Finako 4.0 Berjalan!');
});

// Produk
app.get('/api/products', (req, res) => res.json(dummyProducts));
app.post('/api/products', (req, res) => {
    const newProduct = { id: nextProductId++, ...req.body };
    dummyProducts.push(newProduct);
    res.status(201).json(newProduct);
});

// Kategori Biaya
app.get('/api/expense-categories', (req, res) => res.json(dummyCategories));
app.post('/api/expense-categories', (req, res) => {
    const newCategory = { id: nextCategoryId++, ...req.body };
    dummyCategories.push(newCategory);
    res.status(201).json(newCategory);
});

app.listen(port, () => {
  console.log(`Server backend Finako berjalan di port ${port}`);
});