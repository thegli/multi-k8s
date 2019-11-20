const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});

const sub = redisClient.duplicate();

function fib(index) {
  if (index < 2) {
    if (index == 1) {
      return 1;
    } else {
      return 0;
    }
  }
  return fib(index - 1) + fib(index - 2);
}

// subscription, message is the Fibonacci index
// the Express App publishes the index, which we receive here
sub.on('message', (channel, message) => {
  console.log('Received new message: ' + message);
  // stored the calculated Fibonnaci number (replacind the 'Nothing yet')
  redisClient.hset('values', message, fib(message));
});
// trigger: when anything (=Fib index) is inserted, then perform above calcualation
sub.subscribe('insert');
