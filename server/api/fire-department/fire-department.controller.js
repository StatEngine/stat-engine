'use strict';

import _ from 'lodash';
import Promise from 'bluebird';
import axios from 'axios';
import ngeohash from 'ngeohash';

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

  const fireDepartments = await FireDepartment.findAll({
    where: req.query,
    attributes
  });

  if(!fireDepartments) {
    throw new NotFoundError('Fire department not found');
  }

  res.json(fireDepartments);
}

/**
 * Creates a new fire department
 */
export async function create(req, res) {
  const newFireDepartment = FireDepartment.build(req.body);

  try {
    const fd = await newFireDepartment.save();
    await createCustomer(fd);
    return res.json(fd.dataValues);
  } catch (err) {
    throw new UnprocessableEntityError(err.message);
  }
}

export async function edit(req, res) {
  let fireDepartment = req.fireDepartment;

  fireDepartment = _.merge(fireDepartment, req.body);

  let savedFireDepartment;
  try {
    savedFireDepartment = await fireDepartment.save();
  } catch (err) {
    throw new UnprocessableEntityError(err.message);
  }

  res.status(204).send({savedFireDepartment});
}

/**
 * Get a single fire department
 */
export function get(req, res) {
  return res.json(req.fireDepartment);
}

export async function getUsers(req, res) {
  const users = await FireDepartment.find({
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
  });

  if(!users) {
    throw new NotFoundError('Users not found');
  }

  return res.json(users);
}


/**
 * Gets data quality stats
 */
export async function dataQuality(req, res) {
  const fireIndex = req.fireDepartment.es_indices[req.params.type];

  const qaChecks = {
    noApparatus,
    unTypedApparatus
  };

  const r = await Promise.reduce(_.toPairs(qaChecks), async (results, qa) => {
    const [name, qaConfig] = qa;
    const out = await runQA(_.merge(qaConfig, { index: fireIndex }));
    _.set(results, name, out);
  }, {});

  res.json(gradeQAResults(r));
}

/**
 * Gets NFPA stats
 */
export function nfpa(req, res) {
  const fireIndex = req.fireDepartment.es_indices[req.params.type];

  const qaChecks = {
    nfpa1710,
  };

  return Promise.reduce(_.toPairs(qaChecks), async (results, qa) => {
    // eslint-disable-next-line
    const [name, qaConfig] = qa;
    const out = await runNFPA(_.merge(qaConfig, { index: fireIndex }));
    res.json(out);
  }, {});
}

/*
 * Gets the fire department's chargebee subscription data.
 */
export async function getSubscription(req, res) {
  let subscription;
  try {
    subscription = await retrieveSubscription(req.fireDepartment);
  } catch (err) {
    throw new UnprocessableEntityError(err.message);
  }

  res.json(subscription);
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

export async function loadFireDepartment(req, res, next, id) {
  const fd = await FireDepartment.find({
    where: {
      _id: id
    },
  });

  if(!fd) {
    throw new NotFoundError('Fire department not found');
  }

  req.fireDepartment = fd;
  next();
}

export async function getStations(req, res) {
  const firecares_id = req.fireDepartment.firecares_id;
  const { data } = await axios.get(`https://firecares.org/api/v1/firestations/?department=${firecares_id}`);
  const { objects } = data;

  const stations = objects.map(station => {
    const { geom } = station;
    const { coordinates } = geom;
    const [long, lat] = coordinates;
    const geohash = ngeohash.encode(lat, long, 12);
    return {
      ...station,
      geohash
    };
  });

  res.json(stations);
}

export async function getJurisdictionalBoundary(req, res) {
  const firecares_id = req.fireDepartment.firecares_id;
  const { FIRECARES_USERNAME, FIRECARES_API_KEY } = process.env;
  const url = `https://firecares.org/api/v1/fire-departments/${firecares_id}/?format=json&username=${FIRECARES_USERNAME}&api_key=${FIRECARES_API_KEY}`;

  try  {
    const { data } = await axios.get(url);
    return res.json(data);
  } catch (err) {
    return res.status(500);
  }
}
