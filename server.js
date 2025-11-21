const express = require('express');
const db = require('./database.js');

const app = express();
const port = 3000;

// --- Middleware ---
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// --- Routes ---

// GET: Home page - Display all transactions and the form
app.get('/', (req, res) => {
    const sql = "SELECT * FROM transactions ORDER BY id DESC";
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).send("Error retrieving transactions");
        }

        let totalIncome = 0;
        let totalExpenses = 0;
        rows.forEach(row => {
            if (row.type === 'income') {
                totalIncome += row.amount;
            } else {
                totalExpenses += row.amount;
            }
        });
        const balance = totalIncome - totalExpenses;

        res.render('index', {
            transactions: rows,
            balance: balance.toFixed(2),
            totalIncome: totalIncome.toFixed(2),
            totalExpenses: totalExpenses.toFixed(2)
        });
    });
});

// POST: Add a new transaction
app.post('/add', (req, res) => {
    const { description, amount, type } = req.body;
    const sql = "INSERT INTO transactions (description, amount, type) VALUES (?, ?, ?)";
    db.run(sql, [description, amount, type], (err) => {
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

// --- Start the Server ---
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
