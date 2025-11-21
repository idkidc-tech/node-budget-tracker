const sqlite3 = require('sqlite3').verbose();
const DBSOURCE = "budget.db";

const db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        console.error(err.message);
        throw err;
    } else {
        console.log('Connected to the SQLite database.');
        const sql = `
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            description TEXT NOT NULL,
            amount REAL NOT NULL,
            type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;
        db.run(sql, (err) => {
            if (err) {
                // Table already created
            } else {
                console.log("Table 'transactions' is ready.");
            }
        });
    }
});

module.exports = db;
