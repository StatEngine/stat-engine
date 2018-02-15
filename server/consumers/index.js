import amqp from 'amqplib/callback_api';
import async from 'async';

import config from '../config/environment';

import { consumeTweet } from './consume-tweet';
import { consumeRefreshEnrichmentConfiguration } from './consume-refresh-enrichment-configuration';

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
  done => channel.assertQueue('tweet-recommendation', {}, done),
  done => channel.assertQueue('refresh-enrichment-configuration', {}, done),
], err => {
  if(err) {
    console.error(err);
  }

  // Setup complete, now bind
  channel.consume('tweet-recommendation', msg => {
    consumeTweet(msg, err => {
      if(err) console.error(err);
      channel.ack(msg);
    });
  });

  channel.consume('refresh-enrichment-configuration', msg => {
    consumeRefreshEnrichmentConfiguration(msg, err => {
      if(err) console.error(err);
      channel.ack(msg);
    });
  });
});
