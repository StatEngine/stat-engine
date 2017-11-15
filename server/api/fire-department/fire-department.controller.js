'use strict';

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
  var FireDepartmentId = req.params.id;

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
  return FireDepartment.destroy({ where: { _id: req.params.id } })
    .then(function() {
      res.status(204).end();
    })
    .catch(handleError(res));
}
