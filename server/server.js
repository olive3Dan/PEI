const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
const app = express();
const MAX_RETRIES = 10;
const RETRY_INTERVAL = 2000; // milliseconds

let retryCount = 0;
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

// Enable cross-origin resource sharing
app.use(cors());

const pool = new Pool({
  user: 'postgres',
  host: 'database',
  database: 'geo_data',
  password: 'password',
  port: '5432',
});

connectToDatabase();
/*
 pool.connect((err, client, done) => {
   if (err) {
     console.error('Error connecting to the database:', err.stack);
   } else {
     console.log('Connected to the database :)');
   }
   done();
 });

app.get('/', (req, res) => {
  res.send('<H1>IM AM HERE TO SERVE YOU</H1>');
});*/

app.get("/points", async (req, res) => {
  try {
    const result = await pool.query("SELECT *, ST_AsGeoJSON(coordinates)::json->'coordinates' AS coordinates FROM points");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/add_point", async (req, res) => {
  try {
    const result = await pool.query(
      'INSERT INTO points (name, coordinates) VALUES($1, ST_SetSRID(ST_MakePoint($2, $3), 4326)) RETURNING *',
      [req.body.name, req.body.lon, req.body.lat]
    );
    console.log(result.rows[0]);
    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.delete("/points/:id", async (req, res) => {
  try {
    console.log("DELETE " + req.params.id);
    const result = await pool.query("DELETE FROM points WHERE id = $1", [
      req.params.id,
    ]);
    if (result.rowCount === 0) {
      res.status(404).json({ error: "Point not found" });
    } else {
      res.status(204).send();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});


function connectToDatabase() {
  pool.connect((err, client, done) => {
    if (err) {
      if (retryCount < MAX_RETRIES) {
        console.error('Error connecting to the database:', err.stack);
        console.log(`Retrying in ${RETRY_INTERVAL / 1000} seconds...`);
        retryCount++;
        setTimeout(connectToDatabase, RETRY_INTERVAL);
      } else {
        console.error('Max retries reached. Unable to connect to the database.');
        process.exit(1); // Exit the server if the maximum number of retries is reached
      }
    } else {
      console.log('Connected to the database :)');
      done();
    }
  });
}
