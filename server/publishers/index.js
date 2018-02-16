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
  // Assert Exchange
  done => channel.assertExchange('enrichment-configuration', 'fanout', {durable: false}, done),
], err => {
  if(err) {
    console.error(err);
  }
});

export function publishEnrichmentConfiguration(enrichmentConfiguration) {
  console.info('Publishing Enrichment Configuration');
  channel.publish('enrichment-configuration', '', Buffer.from(JSON.stringify(enrichmentConfiguration)));
}

export default publishEnrichmentConfiguration;
