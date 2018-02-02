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
 * restriction: 'admin'
 */
export function search(req, res) {
  return FireDepartment.find({
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

/**
 * Get a single fire department
 */
export function show(req, res, next) {
  return FireDepartment.find({
    where: {
      firecares_id: req.params.firecaresId
    }
  })
    .then(fireDepartment => {
      if(!fireDepartment) {
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

/**
 * Gets data quality stats
 */
export function dataQuality(req, res) {
  const fireIndex = req.fire_department.es_indices[req.params.type];

  const qaChecks = {
    noApparatus,
    unTypedApparatus
  };

  console.dir(qaChecks);

  return Promise.reduce(_.toPairs(qaChecks), (results, qa) => {
    const [name, qaConfig] = qa;
    return runQA(_.merge(qaConfig, { index: fireIndex }))
      .then(out => _.set(results, name, out));
  }, {})
    .then(r => res.json(gradeQAResults(r)));
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

      console.error(err);
      return res.send(500);
    }
    return res.send(204);
  });
}
