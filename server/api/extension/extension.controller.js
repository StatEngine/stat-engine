import {
  Extension,
  ExtensionRequest,
} from '../../sqldb';
import { NotFoundError } from '../../util/error';

export async function search(req, res) {
  let extensions = await Extension.findAll({});

  if(req.query.limit == 1 && extensions.length > 0) {
    extensions = extensions[0];
  }

  return res.json(extensions);
}

export async function findRequest(req, res) {
  const requested = await ExtensionRequest.find({
    where: {
      user__id: req.user._id,
      extension__id: req.extension._id,
      requested: true,
    }
  });

  let response = {
    requested: false,
  };

  if(requested) response.requested = true;

  res.json(response);
}


export async function request(req, res) {
  const extensionRequest = await ExtensionRequest.create({
    requested: true,
    extension__id: req.extension._id,
    user__id: req.user._id,
  });

  res.json(extensionRequest);
}

export function get(req, res) {
  return res.json(req.extension);
}

export async function loadExtension(req, res, next, id) {
  const extension = await Extension.find({
    where: {
      _id: id
    },
  });

  if(!extension) {
    throw new NotFoundError('Extension not found');
  }

  req.extension = extension;
  next();
}
