'use strict';

import amqp from 'amqplib/callback_api';
import async from 'async';
import _ from 'lodash';

import config from '../../config/environment';
import {FireDepartment} from '../../sqldb';

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function(err) {
    return res.status(statusCode).json(err);
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    return res.status(statusCode).send(err);
  };
}

/**
 * Get list of fire departments
 * restriction: 'admin'
 */
export function index(req, res) {
  return FireDepartment.findAll({
    attributes: [
      '_id',
      'fd_id',
      'name',
      'state',
      'firecares_id',
      'timezone',
    ]
  })
    .then(fireDepartments => {
      res.status(200).json(fireDepartments);
    })
    .catch(handleError(res));
}

/**
 * Creates a new fire department
 */
export function create(req, res) {
  var newFireDepartment = FireDepartment.build(req.body);

  return newFireDepartment.save()
    .then(function(fireDepartment) {
      res.json(fireDepartment);
    })
    .catch(validationError(res));
}

/**
 * Get a single fire department
 */
export function show(req, res, next) {
  var FireDepartmentId = req.params.firecaresId;

  return FireDepartment.find({
    where: {
      _id: FireDepartmentId
    }
  })
    .then(fireDepartment => {
      if(!FireDepartment) {
        return res.status(404).end();
      }
      res.json(fireDepartment);
    })
    .catch(err => next(err));
}

/**
 * Deletes a FireDepartment
 * restriction: 'admin'
 */
export function destroy(req, res) {
  return FireDepartment.destroy({ where: { _id: req.params.firecaresId } })
    .then(function() {
      res.status(204).end();
    })
    .catch(handleError(res));
}

/*
 * Ingest a message into queue
 */
export function queueIngest(req, res) {
  if(_.isEmpty(req.body)) {
    return res.status(400).send('Request body cannot be empty');
  }

  const queueName = req.params.firecaresId;

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
    cb => channel.assertQueue(queueName, null, cb),
    // Write data
    cb => {
      channel.sendToQueue(queueName, req.body, {}, cb);
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
