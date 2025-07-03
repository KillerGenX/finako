require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// CORS configuration with more specific options
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.use(express.json());

// --- DATABASE SEMENTARA (DUMMY) ---
let dummyProducts = [
    { id: 1, name: 'Kopi Susu Gula Aren', price: 18000, category: 'Minuman', description: 'Kopi susu dengan gula aren asli', cost: 8000, stock: 100 },
    { id: 2, name: 'Croissant Cokelat', price: 15000, category: 'Makanan', description: 'Croissant dengan filling cokelat', cost: 7000, stock: 50 },
    { id: 3, name: 'Teh Tarik', price: 12000, category: 'Minuman', description: 'Teh susu khas Malaysia', cost: 5000, stock: 75 },
    { id: 4, name: 'Nasi Goreng Spesial', price: 25000, category: 'Makanan', description: 'Nasi goreng dengan telur dan ayam', cost: 15000, stock: 30 },
    { id: 5, name: 'Kentang Goreng', price: 10000, category: 'Snack', description: 'Kentang goreng renyah', cost: 4000, stock: 80 }
];
let nextProductId = 6;

let dummyCategories = [
    { id: 1, name: 'Gaji', description: 'Pengeluaran untuk gaji karyawan' }, 
    { id: 2, name: 'Sewa', description: 'Biaya sewa tempat usaha' },
    { id: 3, name: 'Bahan Baku', description: 'Pembelian bahan mentah' },
    { id: 4, name: 'Utilitas', description: 'Listrik, air, dan internet' },
    { id: 5, name: 'Pemasaran', description: 'Biaya iklan dan promosi' }
];
let nextCategoryId = 6;

// Data pelanggan
let dummyCustomers = [
    { id: 1, name: 'Ahmad Rizal', phone: '081234567890', email: 'ahmad@example.com', address: 'Jl. Merdeka No. 10, Jakarta' },
    { id: 2, name: 'Siti Aminah', phone: '085678901234', email: 'siti@example.com', address: 'Jl. Pahlawan No. 25, Bandung' },
    { id: 3, name: 'Budi Santoso', phone: '089876543210', email: 'budi@example.com', address: 'Jl. Sudirman No. 45, Surabaya' }
];
let nextCustomerId = 4;

// Data penjualan
let dummySales = [
    { 
        id: 1, 
        date: '2025-06-30T08:30:00.000Z', 
        customer_id: 1, 
        items: [
            { product_id: 1, quantity: 2, price: 18000, discount: 0 },
            { product_id: 5, quantity: 1, price: 10000, discount: 0 }
        ],
        subtotal: 46000,
        tax: 4600,
        total_amount: 50600,
        payment_method: 'cash',
        status: 'completed'
    },
    { 
        id: 2, 
        date: '2025-07-01T10:15:00.000Z', 
        customer_id: 2, 
        items: [
            { product_id: 4, quantity: 1, price: 25000, discount: 0 },
            { product_id: 3, quantity: 2, price: 12000, discount: 0 }
        ],
        subtotal: 49000,
        tax: 4900,
        total_amount: 53900,
        payment_method: 'credit_card',
        status: 'completed'
    }
];
let nextSaleId = 3;

// Data biaya/pengeluaran
let dummyExpenses = [
    { 
        id: 1, 
        date: '2025-06-15T00:00:00.000Z', 
        category_id: 1, 
        amount: 5000000, 
        description: 'Gaji karyawan bulan Juni',
        receipt_number: 'EXP-001'
    },
    { 
        id: 2, 
        date: '2025-06-20T00:00:00.000Z', 
        category_id: 2, 
        amount: 3000000, 
        description: 'Sewa toko bulan Juli',
        receipt_number: 'EXP-002'
    },
    { 
        id: 3, 
        date: '2025-06-25T00:00:00.000Z', 
        category_id: 3, 
        amount: 1500000, 
        description: 'Pembelian bahan baku mingguan',
        receipt_number: 'EXP-003'
    }
];
let nextExpenseId = 4;

// Data profil bisnis
let businessProfile = {
    id: 1,
    name: 'Finako Cafe',
    address: 'Jl. Diponegoro No. 100, Jakarta',
    phone: '021-5551234',
    email: 'contact@finakocafe.com',
    tax_id: '81.273.745.2-407.000',
    logo_url: null,
    owner_name: 'Budi Setiawan',
    establishment_date: '2023-01-15',
    fixed_costs: 8500000,
    avg_selling_price: 20000,
    avg_variable_cost: 10000
};

// --- API ENDPOINTS ---
app.get('/', (req, res) => {
  res.send('Server Backend Finako 4.0 Berjalan!');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Finako Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// === 1. PRODUK API ===
app.get('/api/products', (req, res) => res.json(dummyProducts));

app.get('/api/products/:id', (req, res) => {
  const product = dummyProducts.find(p => p.id == req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Produk tidak ditemukan' });
  }
});

app.post('/api/products', (req, res) => {
    const newProduct = { id: nextProductId++, ...req.body };
    dummyProducts.push(newProduct);
    res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const index = dummyProducts.findIndex(p => p.id == req.params.id);
  if (index !== -1) {
    const updatedProduct = { ...dummyProducts[index], ...req.body };
    dummyProducts[index] = updatedProduct;
    res.json(updatedProduct);
  } else {
    res.status(404).json({ error: 'Produk tidak ditemukan' });
  }
});

app.delete('/api/products/:id', (req, res) => {
  const index = dummyProducts.findIndex(p => p.id == req.params.id);
  if (index !== -1) {
    const deletedProduct = dummyProducts.splice(index, 1)[0];
    res.json(deletedProduct);
  } else {
    res.status(404).json({ error: 'Produk tidak ditemukan' });
  }
});

// === 2. KATEGORI BIAYA API ===
app.get('/api/expense-categories', (req, res) => res.json(dummyCategories));

app.get('/api/expense-categories/:id', (req, res) => {
  const category = dummyCategories.find(c => c.id == req.params.id);
  if (category) {
    res.json(category);
  } else {
    res.status(404).json({ error: 'Kategori tidak ditemukan' });
  }
});

app.post('/api/expense-categories', (req, res) => {
    const newCategory = { id: nextCategoryId++, ...req.body };
    dummyCategories.push(newCategory);
    res.status(201).json(newCategory);
});

app.put('/api/expense-categories/:id', (req, res) => {
  const index = dummyCategories.findIndex(c => c.id == req.params.id);
  if (index !== -1) {
    const updatedCategory = { ...dummyCategories[index], ...req.body };
    dummyCategories[index] = updatedCategory;
    res.json(updatedCategory);
  } else {
    res.status(404).json({ error: 'Kategori tidak ditemukan' });
  }
});

app.delete('/api/expense-categories/:id', (req, res) => {
  const index = dummyCategories.findIndex(c => c.id == req.params.id);
  if (index !== -1) {
    const deletedCategory = dummyCategories.splice(index, 1)[0];
    res.json(deletedCategory);
  } else {
    res.status(404).json({ error: 'Kategori tidak ditemukan' });
  }
});

// === 3. PELANGGAN API ===
app.get('/api/customers', (req, res) => res.json(dummyCustomers));

app.get('/api/customers/:id', (req, res) => {
  const customer = dummyCustomers.find(c => c.id == req.params.id);
  if (customer) {
    res.json(customer);
  } else {
    res.status(404).json({ error: 'Pelanggan tidak ditemukan' });
  }
});

app.post('/api/customers', (req, res) => {
  const newCustomer = { id: nextCustomerId++, ...req.body };
  dummyCustomers.push(newCustomer);
  res.status(201).json(newCustomer);
});

app.put('/api/customers/:id', (req, res) => {
  const index = dummyCustomers.findIndex(c => c.id == req.params.id);
  if (index !== -1) {
    const updatedCustomer = { ...dummyCustomers[index], ...req.body };
    dummyCustomers[index] = updatedCustomer;
    res.json(updatedCustomer);
  } else {
    res.status(404).json({ error: 'Pelanggan tidak ditemukan' });
  }
});

app.delete('/api/customers/:id', (req, res) => {
  const index = dummyCustomers.findIndex(c => c.id == req.params.id);
  if (index !== -1) {
    const deletedCustomer = dummyCustomers.splice(index, 1)[0];
    res.json(deletedCustomer);
  } else {
    res.status(404).json({ error: 'Pelanggan tidak ditemukan' });
  }
});

// === 4. PENJUALAN API ===
app.get('/api/sales', (req, res) => {
  // Menambahkan data pelanggan ke setiap penjualan
  const salesWithCustomers = dummySales.map(sale => {
    const customer = dummyCustomers.find(c => c.id === sale.customer_id) || null;
    return {
      ...sale,
      customer: customer ? { name: customer.name, phone: customer.phone } : null
    };
  });
  res.json(salesWithCustomers);
});

app.get('/api/sales/:id', (req, res) => {
  const sale = dummySales.find(s => s.id == req.params.id);
  if (sale) {
    // Mengambil data pelanggan
    const customer = dummyCustomers.find(c => c.id === sale.customer_id) || null;
    
    // Mengambil detail produk untuk setiap item
    const itemsWithDetails = sale.items.map(item => {
      const product = dummyProducts.find(p => p.id === item.product_id) || null;
      return {
        ...item,
        product: product ? { name: product.name, category: product.category } : null
      };
    });
    
    res.json({
      ...sale,
      customer: customer ? { name: customer.name, phone: customer.phone } : null,
      items: itemsWithDetails
    });
  } else {
    res.status(404).json({ error: 'Penjualan tidak ditemukan' });
  }
});

app.post('/api/sales', (req, res) => {
  const { items = [], customer_id, ...saleData } = req.body;
  
  // Hitung total berdasarkan items
  let subtotal = 0;
  items.forEach(item => {
    subtotal += item.price * item.quantity;
  });
  
  const tax = subtotal * 0.1; // Pajak 10%
  const total = subtotal + tax;
  
  const newSale = { 
    id: nextSaleId++, 
    date: new Date().toISOString(), 
    customer_id,
    items,
    subtotal,
    tax,
    total_amount: total,
    status: 'completed',
    ...saleData
  };
  
  dummySales.push(newSale);
  
  // Update stok produk
  items.forEach(item => {
    const productIndex = dummyProducts.findIndex(p => p.id === item.product_id);
    if (productIndex !== -1) {
      dummyProducts[productIndex].stock -= item.quantity;
    }
  });
  
  res.status(201).json(newSale);
});

// === 5. BIAYA/PENGELUARAN API ===
app.get('/api/expenses', (req, res) => {
  // Menambahkan nama kategori ke setiap pengeluaran
  const expensesWithCategories = dummyExpenses.map(expense => {
    const category = dummyCategories.find(c => c.id === expense.category_id) || null;
    return {
      ...expense,
      category_name: category ? category.name : null
    };
  });
  res.json(expensesWithCategories);
});

app.get('/api/expenses/:id', (req, res) => {
  const expense = dummyExpenses.find(e => e.id == req.params.id);
  if (expense) {
    // Mengambil data kategori
    const category = dummyCategories.find(c => c.id === expense.category_id) || null;
    res.json({
      ...expense,
      category_name: category ? category.name : null
    });
  } else {
    res.status(404).json({ error: 'Pengeluaran tidak ditemukan' });
  }
});

app.post('/api/expenses', (req, res) => {
  const newExpense = { id: nextExpenseId++, date: new Date().toISOString(), ...req.body };
  dummyExpenses.push(newExpense);
  res.status(201).json(newExpense);
});

app.put('/api/expenses/:id', (req, res) => {
  const index = dummyExpenses.findIndex(e => e.id == req.params.id);
  if (index !== -1) {
    const updatedExpense = { ...dummyExpenses[index], ...req.body };
    dummyExpenses[index] = updatedExpense;
    res.json(updatedExpense);
  } else {
    res.status(404).json({ error: 'Pengeluaran tidak ditemukan' });
  }
});

app.delete('/api/expenses/:id', (req, res) => {
  const index = dummyExpenses.findIndex(e => e.id == req.params.id);
  if (index !== -1) {
    const deletedExpense = dummyExpenses.splice(index, 1)[0];
    res.json(deletedExpense);
  } else {
    res.status(404).json({ error: 'Pengeluaran tidak ditemukan' });
  }
});

// === 6. LAPORAN API ===
app.get('/api/reports/sales', (req, res) => {
  const { start_date, end_date } = req.query;
  
  let filteredSales = [...dummySales];
  
  // Filter berdasarkan tanggal
  if (start_date) {
    filteredSales = filteredSales.filter(sale => 
      new Date(sale.date) >= new Date(start_date)
    );
  }
  
  if (end_date) {
    filteredSales = filteredSales.filter(sale => 
      new Date(sale.date) <= new Date(end_date)
    );
  }
  
  // Hitung total penjualan
  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0);
  const totalTransactions = filteredSales.length;
  
  // Kelompokkan berdasarkan tanggal
  const salesByDate = {};
  filteredSales.forEach(sale => {
    const date = new Date(sale.date).toISOString().split('T')[0];
    if (!salesByDate[date]) {
      salesByDate[date] = {
        date,
        total: 0,
        count: 0
      };
    }
    salesByDate[date].total += sale.total_amount;
    salesByDate[date].count += 1;
  });
  
  res.json({
    total_sales: totalSales,
    total_transactions: totalTransactions,
    average_per_transaction: totalTransactions > 0 ? totalSales / totalTransactions : 0,
    sales_by_date: Object.values(salesByDate)
  });
});

app.get('/api/reports/expenses', (req, res) => {
  const { start_date, end_date } = req.query;
  
  let filteredExpenses = [...dummyExpenses];
  
  // Filter berdasarkan tanggal
  if (start_date) {
    filteredExpenses = filteredExpenses.filter(expense => 
      new Date(expense.date) >= new Date(start_date)
    );
  }
  
  if (end_date) {
    filteredExpenses = filteredExpenses.filter(expense => 
      new Date(expense.date) <= new Date(end_date)
    );
  }
  
  // Hitung total pengeluaran
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Kelompokkan berdasarkan kategori
  const expensesByCategory = {};
  filteredExpenses.forEach(expense => {
    const category = dummyCategories.find(c => c.id === expense.category_id);
    const categoryName = category ? category.name : 'Lainnya';
    
    if (!expensesByCategory[categoryName]) {
      expensesByCategory[categoryName] = {
        category: categoryName,
        total: 0,
        count: 0
      };
    }
    expensesByCategory[categoryName].total += expense.amount;
    expensesByCategory[categoryName].count += 1;
  });
  
  res.json({
    total_expenses: totalExpenses,
    expenses_by_category: Object.values(expensesByCategory)
  });
});

// === 7. DASHBOARD API ===
app.get('/api/dashboard', (req, res) => {
  // Total penjualan bulan ini
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const salesThisMonth = dummySales.filter(sale => {
    const saleDate = new Date(sale.date);
    return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
  });
  
  const revenueThisMonth = salesThisMonth.reduce((sum, sale) => sum + sale.total_amount, 0);
  
  // Total biaya bulan ini
  const expensesThisMonth = dummyExpenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });
  
  const expenseThisMonth = expensesThisMonth.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Profit bulan ini
  const profitThisMonth = revenueThisMonth - expenseThisMonth;
  
  // Penjualan terakhir 7 hari
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const salesLastWeek = dummySales.filter(sale => new Date(sale.date) >= oneWeekAgo);
  
  // Hitung data penjualan per hari dalam 7 hari terakhir
  const salesBy7Days = {};
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    salesBy7Days[dateString] = {
      date: dateString,
      total: 0,
      count: 0
    };
  }
  
  salesLastWeek.forEach(sale => {
    const date = new Date(sale.date).toISOString().split('T')[0];
    if (salesBy7Days[date]) {
      salesBy7Days[date].total += sale.total_amount;
      salesBy7Days[date].count += 1;
    }
  });
  
  // Produk terlaris
  const productSales = {};
  dummySales.forEach(sale => {
    sale.items.forEach(item => {
      if (!productSales[item.product_id]) {
        const product = dummyProducts.find(p => p.id === item.product_id);
        productSales[item.product_id] = {
          id: item.product_id,
          name: product ? product.name : `Produk #${item.product_id}`,
          quantity: 0,
          total: 0
        };
      }
      productSales[item.product_id].quantity += item.quantity;
      productSales[item.product_id].total += item.price * item.quantity;
    });
  });
  
  // Sort produk berdasarkan kuantitas terjual
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
  
  res.json({
    summary: {
      revenue_this_month: revenueThisMonth,
      expense_this_month: expenseThisMonth,
      profit_this_month: profitThisMonth,
      product_count: dummyProducts.length,
      customer_count: dummyCustomers.length
    },
    sales_last_7_days: Object.values(salesBy7Days),
    top_products: topProducts,
    business: businessProfile
  });
});

// === 8. TRANSAKSI API ===

// GET: List transaksi
app.get('/api/transactions', (req, res) => {
  // Gabungkan penjualan dan pengeluaran sebagai transaksi
  const salesTransactions = dummySales.map(sale => ({
    id: `sale-${sale.id}`,
    date: sale.date,
    type: 'income',
    category: 'Penjualan',
    amount: sale.total_amount,
    description: `Penjualan #${sale.id}`,
    reference_id: sale.id
  }));
  const expenseTransactions = dummyExpenses.map(expense => {
    const category = dummyCategories.find(c => c.id === expense.category_id);
    return {
      id: `expense-${expense.id}`,
      date: expense.date,
      type: 'expense',
      category: category ? category.name : 'Biaya Operasional',
      amount: expense.amount,
      description: expense.description,
      reference_id: expense.id
    };
  });
  // Gabungkan dan urutkan berdasarkan tanggal terbaru
  const allTransactions = [...salesTransactions, ...expenseTransactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(allTransactions);
});

// POST: Tambah transaksi baru (dummy, hanya return data yang dikirim)
app.post('/api/transactions', (req, res) => {
  // Di production, seharusnya data disimpan ke database
  // Di sini cukup return data yang dikirim sebagai dummy
  res.status(201).json({ message: 'Transaksi berhasil disimpan (dummy)', ...req.body });
});

// === 9. BUSINESS PROFILE API ===
app.get('/api/business', (req, res) => {
  res.json(businessProfile);
});

app.put('/api/business', (req, res) => {
  businessProfile = { ...businessProfile, ...req.body };
  res.json(businessProfile);
});

// 404 handler untuk endpoint yang tidak ada
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint tidak ditemukan',
    message: `Path ${req.originalUrl} tidak tersedia`
  });
});

app.listen(port, () => {
  console.log(`Server backend Finako berjalan di port ${port}`);
});