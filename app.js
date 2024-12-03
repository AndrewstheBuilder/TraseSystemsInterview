const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Initialize SQLite Database
const db = new sqlite3.Database(":memory:");

// Create Tables and Insert Initial Data
db.serialize(() => {
  db.run(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE
    )
  `);

  db.run(`
    CREATE TABLE posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  db.run(`INSERT INTO users (name, email) VALUES ('John Doe', 'john@example.com')`);
  db.run(`INSERT INTO posts (title, content, user_id) VALUES ('First Post', 'Hello World!', 1)`);
});

// Routes
// users
app.get("/users", (req, res) => {
  db.all("SELECT * FROM users", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/users", (req, res) => {
  const { name, email } = req.body;
  db.run("INSERT INTO users (name, email) VALUES (?, ?)", [name, email], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.status(201).json({ id: this.lastID, name, email });
  });
});

app.get("/users/:id", (req, res) => {
  db.get("SELECT * FROM users WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "User not found" });
    res.json(row);
  });
});

app.put("/users/:id", (req, res) => {
    const { name, email } = req.body;
    db.run(
      "UPDATE users SET name = ?, email = ? WHERE id = ?",
      [name, email, req.params.id],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "User not found" });
        res.json({ id: req.params.id, name, email });
      }
    );
  });
  
  app.delete("/users/:id", (req, res) => {
    db.run("DELETE FROM users WHERE id = ?", [req.params.id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "User not found" });
      res.status(204).send();
    });
  });
  

//posts
app.get("/posts", (req, res) => {
  db.all("SELECT * FROM posts", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/posts", (req, res) => {
    const { title, content, user_id } = req.body;
    // Validate user_id exists
    db.get("SELECT * FROM users WHERE id = ?", [user_id], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(400).json({ error: "Invalid user_id" });
    })  
    db.run(
        "INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)",
        [title, content, user_id],
        function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.status(201).json({ id: this.lastID, title, content, user_id });
        }
    );
});

app.get("/posts/:id", (req, res) => {
  db.get("SELECT * FROM posts WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Post not found" });
    res.json(row);
  });
});

app.put("/posts/:id", (req, res) => {
    const { title, content, user_id } = req.body;
  
    // Validate user_id exists
    db.get("SELECT * FROM users WHERE id = ?", [user_id], (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(400).json({ error: "Invalid user_id" });
  
      db.run(
        "UPDATE posts SET title = ?, content = ?, user_id = ? WHERE id = ?",
        [title, content, user_id, req.params.id],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          if (this.changes === 0) return res.status(404).json({ error: "Post not found" });
          res.json({ id: req.params.id, title, content, user_id });
        }
      );
    });
  });
  
  app.delete("/posts/:id", (req, res) => {
    db.run("DELETE FROM posts WHERE id = ?", [req.params.id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "Post not found" });
      res.status(204).send();
    });
  });

// Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
