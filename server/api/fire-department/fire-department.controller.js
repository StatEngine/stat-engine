'use strict';

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
import { process } from '@statengine/se-ingest-router';

import {
  FireDepartment,
  User,
} from '../../sqldb';

import {
  runQA,
  noApparatus,
  unTypedApparatus,
  gradeQAResults } from './fire-department-data-quality.controller';

import {
  runNFPA,
  nfpa1710,
} from './fire-department-nfpa.controller';

import { createCustomer } from '../../subscription/chargebee';

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
  const attributes = [
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
  ];

  if(req.user && req.user.isAdmin) {
    attributes.push('customer_id');
  }

  return FireDepartment.findAll({
    where: req.query,
    attributes
  })
    .then(fireDepartments => {
      if(!fireDepartments) {
        return res.status(404).end();
      }
      return res.json(fireDepartments);
    })
    .catch(validationError(res));
}

function seedKibana(fireDepartment) {
  const options = {
    force: true
  };

  const locals = {
    FireDepartment: fireDepartment.get()
  };


  return new Promise((resolve, reject) => {
    seedKibanaAll(options, locals, err => {
      if(err) {
        console.error(err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Creates a new fire department
 */
export function create(req, res) {
  const newFireDepartment = FireDepartment.build(req.body);

  return newFireDepartment.save()
    .then(fd => Promise.all([seedKibana(fd), createCustomer(fd)]))
    .then(() => res.status(204).send())
    .catch(() => validationError(res));
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

export function getUsers(req, res) {
  return FireDepartment.find({
    where: {
      _id: req.user.FireDepartment._id
    },
    attributes: [
      '_id',
    ],
    include: [{
      model: User,
      attributes: ['first_name', 'last_name', 'role']
    }]
  })
    .then(users => {
      if(!users) {
        return res.status(404).end();
      }
      return res.json(users);
    })
    .catch(validationError(res));
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
    // eslint-disable-next-line
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

  console.log('Queing ingest');
  console.log(req.body);
  process(req.body)
    .then(() => res.status(204).send())
    .catch(() => res.status(500));
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
