// server.js
const express = require('express');
const db = require('./database.js');

const app = express();
const port = 3000;

// --- Middleware ---
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// --- Routes ---

// GET: Home page - Display all transactions, form, and charts
app.get('/', (req, res) => {
    const transactionsSql = "SELECT t.id, t.description, t.amount, t.type, t.date, c.name as category_name FROM transactions t LEFT JOIN categories c ON t.category_id = c.id ORDER BY t.id DESC";
    const categoriesSql = "SELECT * FROM categories ORDER BY name ASC";

    db.all(transactionsSql, [], (err, transactions) => {
        if (err) {
            return res.status(500).send("Error retrieving transactions");
        }

        db.all(categoriesSql, [], (err, categories) => {
            if (err) {
                return res.status(500).send("Error retrieving categories");
            }

            // Calculate totals
            let totalIncome = 0;
            let totalExpenses = 0;
            transactions.forEach(t => {
                if (t.type === 'income') totalIncome += t.amount;
                else totalExpenses += t.amount;
            });
            const balance = totalIncome - totalExpenses;

            res.render('index', {
                transactions: transactions,
                categories: categories,
                balance: balance.toFixed(2),
                totalIncome: totalIncome.toFixed(2),
                totalExpenses: totalExpenses.toFixed(2)
            });
        });
    });
});

// POST: Add a new transaction
app.post('/add', (req, res) => {
    const { description, amount, type, category_id } = req.body;
    const sql = "INSERT INTO transactions (description, amount, type, category_id) VALUES (?, ?, ?, ?)";
    db.run(sql, [description, amount, type, category_id], (err) => {
        if (err) {
            return res.status(500).send("Error adding transaction");
        }
        res.redirect('/');
    });
});

// POST: Delete a transaction
app.post('/delete/:id', (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM transactions WHERE id = ?";
    db.run(sql, id, (err) => {
        if (err) {
            return res.status(500).send("Error deleting transaction");
        }
        res.redirect('/');
    });
});

// API GET: Get data for the expense chart
app.get('/api/chart-data', (req, res) => {
    const sql = `
        SELECT c.name, SUM(t.amount) as total
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.type = 'expense'
        GROUP BY c.name
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            labels: rows.map(row => row.name),
            data: rows.map(row => row.total)
        });
    });
});

// --- Start the Server ---
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
