import {
  Extension,
  ExtensionRequest,
} from '../../sqldb';

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    console.error(err);
    return res.status(statusCode).send(err);
  };
}

export function search(req, res) {
  return Extension.findAll({})
    .then(extensions => {
      if(req.query.limit == 1 && extensions.length > 0) {
        extensions = extensions[0];
      }
      return res.json(extensions);
    })
    .catch(handleError(res));
}

export function findRequest(req, res) {
  return ExtensionRequest.find({
    where: {
      user__id: req.user._id,
      extension__id: req.extension._id,
      requested: true,
    }
  })
    .then(requested => {
      let response = {
        requested: false,
      };

      if(requested) response.requested = true;

      res.json(response);
    })
    .catch(handleError(res));
}


export function request(req, res) {
  return ExtensionRequest.create({
    requested: true,
    extension__id: req.extension._id,
    user__id: req.user._id,
  })
    .then(extensionRequest => {
      res.json(extensionRequest);
    })
    .catch(handleError(res));
}

export function get(req, res) {
  return res.json(req.extension);
}

export function loadExtension(req, res, next, id) {
  Extension.find({
    where: {
      _id: id
    },
  })
    .then(extension => {
      if(extension) {
        req.extension = extension;
        return next();
      }
      return res.status(404).send({ error: 'Extension not found'});
    })
    .catch(err => next(err));
}
