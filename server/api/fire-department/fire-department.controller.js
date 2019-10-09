'use strict';

import _ from 'lodash';
import Promise from 'bluebird';

import {
  FireDepartment,
  User,
} from '../../sqldb';

import {
  runQA,
  noApparatus,
  unTypedApparatus,
  gradeQAResults
} from './fire-department-data-quality.controller';

import {
  runNFPA,
  nfpa1710,
} from './fire-department-nfpa.controller';

import { createCustomer, retrieveSubscription } from '../../subscription/chargebee';
import { UnprocessableEntityError, NotFoundError, ForbiddenError } from '../../util/error';


/**
 * Search for fire departments
 */
export async function search(req, res) {
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

  let fireDepartments;
  try {
    fireDepartments = FireDepartment.findAll({
      where: req.query,
      attributes
    });
  } catch (err) {
    throw new UnprocessableEntityError(err.message);
  }

  if(!fireDepartments) {
    throw new NotFoundError('Fire department not found');
  }

  res.json(fireDepartments);
}

/**
 * Creates a new fire department
 */
export function create(req, res) {
  const newFireDepartment = FireDepartment.build(req.body);

  return newFireDepartment.save()
    .then(fd => Promise.all([createCustomer(fd)]))
    .then(() => res.status(204).send())
    .catch(err => {
      throw new UnprocessableEntityError(err.message);
    });
}

export function edit(req, res) {
  let fireDepartment = req.fireDepartment;

  fireDepartment = _.merge(fireDepartment, req.body);

  return fireDepartment.save()
    .then(savedFireDepartment => {
      res.status(204).send({savedFireDepartment});
    })
    .catch(err => {
      throw new UnprocessableEntityError(err.message);
    });
}

/**
 * Get a single fire department
 */
export function get(req, res) {
  return res.json(req.fireDepartment);
}

export async function getUsers(req, res) {
  let users;
  try {
    users = FireDepartment.find({
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
  } catch (err) {
    throw new UnprocessableEntityError(err.message);
  }

  if(!users) {
    throw new NotFoundError('Users not found');
  }

  return res.json(users);
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
    .then(r => res.json(gradeQAResults(r)));
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
  }, {});
}

/*
 * Gets the fire department's chargebee subscription data.
 */
export function getSubscription(req, res) {
  return retrieveSubscription(req.fireDepartment)
    .then(subscription => res.json(subscription))
    .catch(err => {
      throw new UnprocessableEntityError(err.message);
    });
}

export function hasAdminPermission(req, res, next) {
  if(req.user.isAdmin) return next();
  if(req.user.isDepartmentAdmin && req.user.FireDepartment._id.toString() === req.params.id) return next();

  else throw new ForbiddenError('User is not authorized to perform this function');
}

export function hasReadPermission(req, res, next) {
  if(req.user.isAdmin) return next();
  if(req.user.FireDepartment._id.toString() === req.params.id) return next();

  else throw new ForbiddenError('User is not authorized to perform this function');
}

export function hasIngestPermission(req, res, next) {
  if(req.user.isAdmin) return next();
  if(req.user.isIngest && req.user.FireDepartment._id.toString() === req.params.id) return next();

  else throw new ForbiddenError('User is not authorized to perform this function');
}

export function loadFireDepartment(req, res, next, id) {
  return FireDepartment.find({
    where: {
      _id: id
    },
  })
    .then(fd => {
      if(!fd) {
        throw new NotFoundError('Fire department not found');
      }

      req.fireDepartment = fd;
      next();
    })
}
