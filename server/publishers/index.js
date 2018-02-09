import amqp from 'amqplib/callback_api';
import async from 'async';

import config from '../config/environment';

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
  done => channel.assertExchange('enrichment-configuration', 'fanout', {durable: false}, done),
], (err) => {
  if (err) {
    console.error(err);
  }
});

module.exports.publishEnrichmentConfiguration = (enrichmentConfiguration, done) => {
  console.info('Publishing Enrichment Configuration');
  console.dir(JSON.stringify(enrichmentConfiguration));
  channel.publish('enrichment-configuration', '', new Buffer(JSON.stringify(enrichmentConfiguration)));
}
