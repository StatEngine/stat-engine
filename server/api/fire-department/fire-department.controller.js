'use strict';

import amqp from 'amqplib/callback_api';
import async from 'async';
import _ from 'lodash';
import Promise from 'bluebird';

import config from '../../config/environment';
import { FireDepartment } from '../../sqldb';

import {
  runQA,
  noApparatus,
  unTypedApparatus,
  gradeQAResults } from './fire-department-data-quality.controller';

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
 * Search for fire departments
 */
export function search(req, res) {
  return FireDepartment.findAll({
    where: req.query
  })
    .then(fireDepartments => {
      if(!fireDepartments) {
        return res.status(404).end();
      }
      return res.json(fireDepartments);
    })
    .catch(validationError(res));
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

export function edit(req, res) {
  let fireDepartment = req.fireDepartment;

  fireDepartment = _.merge(fireDepartment, req.body);

  fireDepartment.save()
    .then(savedFireDepartment => {
      res.status(204).send({savedFireDepartment});
    })
    .catch(validationError(res));
}

/**
 * Get a single fire department
 */
export function get(req, res) {
  return res.json(req.fireDepartment);
}

/**
 * Gets data quality stats
 */
export function dataQuality(req, res) {
  const fireIndex = req.fireDepartment.es_indices[req.params.type];

  const qaChecks = {
    noApparatus,
    unTypedApparatus
  };

  return Promise.reduce(_.toPairs(qaChecks), (results, qa) => {
    const [name, qaConfig] = qa;
    return runQA(_.merge(qaConfig, { index: fireIndex }))
      .then(out => _.set(results, name, out));
  }, {})
    .then(r => res.json(gradeQAResults(r)))
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
    cb => amqp.connect(config.amqp.uri, (err, openConnection) => {
      connection = openConnection;
      cb(err);
    }),
    // Open channel
    cb => connection.createChannel((err, openChannel) => {
      channel = openChannel;
      cb(err);
    }),
    // Write data
    cb => {
      channel.sendToQueue(queueName, req.body, {});
      cb();
    },
    cb => channel.close(cb),
    cb => connection.close(cb),
  ], err => {
    // HTTP return
    if(err) {
      // force cleanup channel + connection
      if(channel) channel.close();
      if(connection) connection.close();

      return res.send(500);
    }
    return res.send(204);
  });
}

export function hasAdminPermission(req, res, next) {
  if(req.user.isAdmin) return next();
  if(req.user.isDepartmentAdmin && req.fireDepartment._id.toString() === req.params.id) return next();

  else res.status(403).send({ error: 'User is not authorized to perform this function' });
}

export function loadFireDepartment(req, res, next, id) {
  FireDepartment.find({
    where: {
      _id: id
    },
  })
    .then(fd => {
      if(fd) {
        req.fireDepartment = fd;
        return next();
      }
      return res.status(404).send({ error: 'Fire Department not found'});
    })
    .catch(err => next(err));
}
