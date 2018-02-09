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
  return ExtensionConfiguration.find({
    where: {
      fire_department__id: req.user.fire_department__id,
      enabled: true,
    },
    include: [{
      model: Extension,
      where: { name: req.query.name }
    }]
  }).then(extensionConfiguration => {
      if (req.query.limit === 1 && extensionConfiguration.length > 0) {
        extensionConfiguration = extensionConfiguration[0];
      }
      return res.json(extensionConfiguration);
    })
    .catch(validationError(res));
}
