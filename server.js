const express = require("express");
const mysql2 = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");


require("dotenv").config();


const app = express();
app.use(express.json());
app.use(cors());


const db = mysql2.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "user_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});


db.getConnection((err) => {
    if (err) {
        console.log("Database Connection Failed", err);
    } else {
        console.log("Connected to MySQL database");
    }
});


//register


app.post("/register", async (req, res) => {
    const { username, password } = req.body;


    if (!username || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }


    const hashedPassword = await bcrypt.hash(password, 10);


    const checkUserSql = "SELECT * FROM users WHERE username = ?";


    db.query(checkUserSql, [username], (err, results) => {
        if (err) return res.status(500).json({ message: "Database Error" });
        if (results.length > 0) {
            return res.status(400).json({ message: "Username already exist" });
        }
        const insertUserSql = "INSERT INTO users (username, password) VALUES (?,?)";
        db.query(insertUserSql, [username, hashedPassword], (err, result) => {
            if (err) return res.status(500).json({ message: "Registration Failed" });


            res.status(201).json({ message: "User registered successfully" });
        });
    });
});


// Login User
app.post("/login", (req, res) => {
    const { username, password } = req.body;


    if (!username || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }


    const sql = "SELECT * FROM users WHERE username = ?";
    db.query(sql, [username], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(400).json({ message: "Invalid username or password" });
        }


        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);


        if (!isMatch) {
            return res.status(400).json({ message: "Invalid username or password" });
        }


        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });


        res.json({ message: "Login successful", token, username: user.username });
    });
});


app.get("/api/items", (req, res) => {
    const sql = "SELECT * FROM items";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(results);
    });
});


// POST new item
app.post("/api/items", (req, res) => {
    const { name } = req.body;
    const sql = "INSERT INTO items (name) VALUES (?)";
    db.query(sql, [name], (err, result) => {
        if (err) return res.status(500).json({ message: "Insert failed" });
        res.status(201).json({ id: result.insertId, name });
    });
});


// PUT update item
app.put("/api/items/:id", (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const sql = "UPDATE items SET name = ? WHERE id = ?";
    db.query(sql, [name, id], (err) => {
        if (err) return res.status(500).json({ message: "Update failed" });
        res.json({ id: parseInt(id), name });
    });
});


// DELETE item
app.delete("/api/items/:id", (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM items WHERE id = ?";
    db.query(sql, [id], (err) => {
        if (err) return res.status(500).json({ message: "Delete failed" });
        res.json({ message: "Item deleted" });
    });
});


app.listen(5000, () => {
    console.log("Server running on port 5000");
});
