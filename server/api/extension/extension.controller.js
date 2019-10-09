import {
  Extension,
  ExtensionRequest,
} from '../../sqldb';
import { NotFoundError } from '../../util/error';

export function search(req, res) {
  return Extension.findAll({})
    .then(extensions => {
      if(req.query.limit == 1 && extensions.length > 0) {
        extensions = extensions[0];
      }
      return res.json(extensions);
    });
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
    });
}


export function request(req, res) {
  return ExtensionRequest.create({
    requested: true,
    extension__id: req.extension._id,
    user__id: req.user._id,
  })
    .then(extensionRequest => {
      res.json(extensionRequest);
    });
}

export function get(req, res) {
  return res.json(req.extension);
}

export function loadExtension(req, res, next, id) {
  return Extension.find({
    where: {
      _id: id
    },
  })
    .then(extension => {
      if(!extension) {
        throw new NotFoundError('Extension not found');
      }

      req.extension = extension;
      next();
    });
}
