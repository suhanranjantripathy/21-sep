const pg = require('pg');
const express = require("express")
const {Pool} = pg;
const app = express()

const pool = new Pool({
  user: 'suhanranjantripathy',
  host: 'localhost',
  database: 'db4',
  password: '',
  port: 5432,
});

app.get("/assingments", async(res,req)=>{
    try {
    const result = await pool.query(`SELECT * FROM assignments`);
    console.log(result.rows);

    }catch (err) {
        console.error('Error fetching data:', err);
    }

})
app.post("/assingments", async(res,req)=>{
    const {title, deadline, submitted} = req.body

    try {
    const result = await pool.query(`INSERT INTO assignments
(title, deadline)
VALUES (${title},${deadline},${submitted})
RETURNING *;`);
    console.log(result.rows);

    }catch (err) {
        console.error('Error fetching data:', err);
    }

})

app.listen(3000,()=>{
    console.log(`app is running`)
})


getData();