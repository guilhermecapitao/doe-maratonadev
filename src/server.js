const express = require('express');
const nunjucks = require('nunjucks');
const dbConfig = require('./config/database');
const Pool = require('pg').Pool

const server = express();

server.use(express.static('src/public'));
server.use(express.urlencoded({ extended: true }));

const db = new Pool(dbConfig);
nunjucks.configure("./", { express: server, noCache: true })

/**
 * Routes
 */

server.get("/", function(req, res) {
    db.query("SELECT * FROM donors", function(err, result) {
        if (err) return res.send("Database error");

        const donors = result.rows;

        res.render('src/index.html', { donors });
    })

})

server.post("/", function(req, res) {
    const name = req.body.name;
    const email = req.body.email;
    const blood = req.body.blood;

    if (!name || !email || !blood)
        return res.send("All fields are necessary");

    const query = `
    INSERT INTO donors ("name", "email", "blood") 
    VALUES ($1, $2, $3)
    `;

    const values = [name, email, blood];

    db.query(query, values, function(err) {
        if (err) return res.send("Database error");

        return res.redirect("/");
    });

})

server.listen(3333);