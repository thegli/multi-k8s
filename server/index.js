/* the actual API application
 * connects to a Redis and a Postgres database:
 *  Redis: keeps the history of already calculated Fibonacci numbers
 *  Postgres: stores the encountered indices
 */

const keys = require('./keys');

// Express App setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres Client setup
const { Pool } = require('pg');
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
});
pgClient.on('error', () => console.log('Lost Postgres connection'));

// nuber is he Fibonacc index
pgClient
  .query('CREATE TABLE IF NOT EXISTS values (number INT)')
  .catch(err => console.log(err));


// Redis Client setup
const redis = require('redis');
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});

const redisPublisher = redisClient.duplicate();


// Express route handlers

app.get('/', (req, res) => {
  res.send('Hi, this is the api server of the complex application');
});

app.get('/values/all', async(req, res) => {
  const values = await pgClient.query('SELECT * FROM values');
  // jst return the rows
  res.send(values.rows);
});

// await not availalbe in Redis client...
app.get('/values/current', async(req, res) => {
  redisClient.hgetall('values', (err, values) => {
    res.send(values);
  })
});

app.post('/values', async(req, res) => {
  const index = req.body.index;

  if (parseInt(index) > 40) {
    return res.status(422).send('Index too high');
  }
  if (isNaN(parseInt(index))) {
    console.log("Invalid index, not a int!");
  } else {
    console.log("Submitted index: " + index);

    // store the index, and a placeholder for the to-be-calculated Fibonacci number
    redisClient.hset('values', index, 'Nothing yet!');
    // publish the index
    redisPublisher.publish('insert', index);
    // store the encountered index
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);
  }

  res.send({
    working: true
  });
});

app.listen(5000, err => {
  console.log('Listening');
})
