require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');



const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});
pool.connect()
    .then (() => console.log("Connected to PostgreSQL succesfully!"))
    .catch(err => console.error("Database connection error", err.stack));



app.use(express.json());



app.post('/auth/register',async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const role = req.body.role;

    try {
        const hash = await bcrypt.hash(req.body.password,11);
        await pool.query('INSERT INTO users(name, email, password_hash, role) VALUES ($1,$2,$3,$4)',[name,email,hash,role]); 
    }catch(error){
        if (error.code === '23505'){
            return res.status(409).json({message: "Email already in-use"});
        }else{
            return res.status(500).json({error: "Server encountered database error"});     
        }
        }
    
    res.json({message: "You created your account succesfully"});
});

app.post('/auth/login', async (req,res) => {
    const email = req.body.email;
    const password = req.body.password;

    try{
        const result = await pool.query('SELECT password_hash FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0){
            res.json({message: "You neeed to create an account first"});
        }else{
            const match = await bcrypt.compare(password, result.rows[0].password_hash);

            if (match){
                res.json({message: "Logged in successfuly"});
            }else{
                return res.json({message: "Incorrect email/password"});
            }
        }
    }catch(error){
        console.error(error);
        res.status(500).json({error: "Server encountered database error"});
    }
});



if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is listening on http://localhost:${PORT}`);
    });
}

module.exports = app;