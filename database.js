// database.js
const sqlite3 = require('sqlite3').verbose();
const DBSOURCE = "budget.db";

const db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        console.error(err.message);
        throw err;
    } else {
        console.log('Connected to the SQLite database.');

        // Create categories table
        db.run(`CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            type TEXT NOT NULL CHECK(type IN ('income', 'expense'))
        )`, (err) => {
            if (err) {
                // Table already created
            } else {
                console.log("Table 'categories' is ready.");
                // Pre-populate categories
                const defaultCategories = [
                    ['Salary', 'income'], ['Freelance', 'income'], ['Investments', 'income'],
                    ['Groceries', 'expense'], ['Rent', 'expense'], ['Utilities', 'expense'],
                    ['Transport', 'expense'], ['Entertainment', 'expense'], ['Eating Out', 'expense'],
                    ['Shopping', 'expense'], ['Healthcare', 'expense'], ['Other', 'expense']
                ];
                const insertStmt = db.prepare("INSERT OR IGNORE INTO categories (name, type) VALUES (?, ?)");
                defaultCategories.forEach(cat => insertStmt.run(cat));
                insertStmt.finalize();
            }
        });

        // Create transactions table with a foreign key to categories
        db.run(`CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            description TEXT NOT NULL,
            amount REAL NOT NULL,
            type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
            category_id INTEGER,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories (id)
        )`, (err) => {
            if (err) {
                // Table already created
            } else {
                console.log("Table 'transactions' is ready.");
            }
        });
    }
});

module.exports = db;
