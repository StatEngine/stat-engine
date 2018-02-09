import async from 'async';

import { Extension } from '../../sqldb';
import { ExtensionConfiguration } from '../../sqldb';

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

export function search(req, res) {
  return Extension.findAll({})
    .then(extensions => {
      if (req.query.limit == 1 && extensions.length > 0) {
        extensions = extensions[0];
      }
      return res.json(extensions);
    })
    .catch(validationError(res));
}
