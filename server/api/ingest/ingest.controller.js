import config from '../../config/environment';
import amqp from 'amqplib/callback_api';
import async from 'async';
import _ from 'lodash';

export function queue(req, res) {
  let connection;
  let channel;

  async.series([
    // Open connection
    cb => amqp.connect(config.amqp, (err, openConnection) => {
      connection = openConnection;
      cb(err);
    }),
    // Open channel
    cb => connection.createConfirmChannel((err, openChannel) => {
      channel = openChannel;
      cb(err);
    }),
    // Ensure queue exists
    cb => channel.assertQueue(req.amqp.queue_name, null, cb),
    // Write data
    cb => {
      const options = {
        headers: {
          data_type: req.amqp.data_type,
          action: req.amqp.action,
        }
      };
      // delete messages dont have body so add a empty string
      const msg = _.isEmpty(req.body) ? new Buffer('') : req.body;
      channel.sendToQueue(req.amqp.queue_name, msg, options, cb);
    }
  ], err => {
    // cleanup channel + connection
    if(channel) channel.close();
    if(connection) connection.close();

    // HTTP return
    if(err) {
      console.error(err);
      return res.send(500);
    }
    return res.send(204);
  });
}

// set AMQP routing paframs
export function setAMQPRouting(req, res, next) {
  req.amqp = {
    queue_name: `${req.query.fd_id}-ingest`,
    data_type: req.params.type,
    fd_id: req.query.fd_id,
  };

  if(req.method === 'PUT') {
    req.amqp.action = 'upsert';
  } else if(req.method === 'DELETE') {
    req.amqp.action = 'delete';
  } else {
    return next(new Error('Unsupported HTTP action.  ingest only supports PUT or DELETE'));
  }

  next();
}
