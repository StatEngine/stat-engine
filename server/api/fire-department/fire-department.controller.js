'use strict';

import amqp from 'amqplib/callback_api';
import async from 'async';
import _ from 'lodash';
import Promise from 'bluebird';
import {
  seedKibanaAll,
  seedKibanaConfig,
  seedKibanaDashboards,
  seedKibanaIndexPatterns,
  seedKibanaVisualizations,
} from '@statengine/se-fixtures';

import config from '../../config/environment';
import { FireDepartment } from '../../sqldb';

import {
  runQA,
  noApparatus,
  unTypedApparatus,
  gradeQAResults } from './fire-department-data-quality.controller';

import {
  runNFPA,
  nfpa1710,
} from './fire-department-nfpa.controller';

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
    where: req.query,
    attributes: [
      'firecares_id',
      '_id',
      'name',
      'fd_id',
      'timezone',
      'state',
      'integration_complete',
      'integration_verified',
      'latitude',
      'longitude',
    ]
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
      const options = {
        force: true
      };

      const locals = {
        FireDepartment: fireDepartment.get()
      };

      seedKibanaAll(options, locals, err => {
        if(err) {
          console.error(err);
          res.status(500).send(err);
        } else {
          res.json(fireDepartment);
        }
      });
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

/**
 * Gets NFPA stats
 */
export function nfpa(req, res) {
  const fireIndex = req.fireDepartment.es_indices[req.params.type];

  const qaChecks = {
    nfpa1710,
  };

  return Promise.reduce(_.toPairs(qaChecks), (results, qa) => {
    const [name, qaConfig] = qa;
    return runNFPA(_.merge(qaConfig, { index: fireIndex }))
      .then(out => res.json(out));
  }, {})
    .catch(handleError(res));
}


export function fixtureType(req, res, next) {
  let fnc;

  switch (req.params.fixtureType) {
  case 'config':
    fnc = seedKibanaConfig;
    break;

  case 'visualization':
    fnc = seedKibanaVisualizations;
    break;

  case 'dashboard':
    fnc = seedKibanaDashboards;
    break;

  case 'indexPattern':
    fnc = seedKibanaIndexPatterns;
    break;

  case 'all':
    fnc = seedKibanaAll;
    break;

  default:
    return res.status(404).send();
  }

  req.seedFnc = fnc;
  next();
}

export function fixtures(req, res) {
  const options = {
    force: true
  };

  const locals = {
    FireDepartment: req.fireDepartment.get()
  };

  req.seedFnc(options, locals, err => {
    if(err) {
      console.error(err);
      res.status(500).send(err);
    } else {
      res.status(200).send();
    }
  });
}

export function multiFixtures(req, res) {
  const options = {
    force: true
  };

  return FireDepartment.findAll({})
    .then(fireDepartments => {
      if(!fireDepartments) {
        return res.status(404).end();
      }

      async.each(fireDepartments, (fireDepartment, done) => {
        const locals = {
          FireDepartment: fireDepartment.get()
        };

        req.seedFnc(options, locals, done);
      }, err => {
        if(err) {
          console.error(err);
          res.status(500).send(err);
        } else {
          res.status(200).send();
        }
      });
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

  const queueName = req.fireDepartment.firecares_id;

  let connection;
  let channel;

  async.series([
    // Open connection
    cb => amqp.connect(config.amqp.uri, (err, openConnection) => {
      connection = openConnection;
      cb(err);
    }),
    // Open channel
    cb => connection.createConfirmChannel((err, openChannel) => {
      channel = openChannel;
      cb(err);
    }),
    // Assert queue
    cb => channel.assertQueue(queueName, { deadLetterExchange: 'dlx.direct', deadLetterRoutingKey: 'uncaught-error' }, cb),
    // Write data
    cb => channel.sendToQueue(queueName, Buffer.from(JSON.stringify(req.body)), {}, cb),
    // Cleanup
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
  if(req.user.isDepartmentAdmin && req.user.FireDepartment._id.toString() === req.params.id) return next();

  else res.status(403).send({ error: 'User is not authorized to perform this function' });
}

export function hasReadPermission(req, res, next) {
  if(req.user.isAdmin) return next();
  if(req.user.FireDepartment._id.toString() === req.params.id) return next();

  else res.status(403).send({ error: 'User is not authorized to perform this function' });
}

export function hasIngestPermission(req, res, next) {
  if(req.user.isAdmin) return next();
  if(req.user.isIngest && req.user.FireDepartment._id.toString() === req.params.id) return next();

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
