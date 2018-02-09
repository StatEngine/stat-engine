import amqp from 'amqplib/callback_api';
import async from 'async';

import config from '../config/environment';

import { consumeTweet } from './consume-tweet';

let connection;
let channel;

async.series([
  // Open connection
  done => amqp.connect(config.amqp.uri, (err, openConnection) => {
    connection = openConnection;
    done(err);
  }),
  // Open channel
  done => connection.createChannel((err, openChannel) => {
    channel = openChannel;
    done(err);
  }),
  // exchange + queue to catch uncaught errors
  done => channel.assertExchange('dlx.direct', 'direct', null, done),
  done => channel.assertQueue('tweet-recommendations', {}, done),
  done => channel.consume('tweet-recommendations', msg => {
    consumeTweet(msg, (err) => {
      console.dir('acking')
      channel.ack(msg);
    })
  }),

], (err) => {
  // cleanup channel + connection
  if (channel) channel.close();
  if (connection) connection.close();

  if (err) {
    logger.error(err);
    process.exit(1);
  }
});
