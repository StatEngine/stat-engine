import {
  Extension,
} from '../../sqldb';

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    console.error(err);
    return res.status(statusCode).send(err);
  };
}

export function search(req, res) {
  const where = {};
  if(req.query.name) where.name = req.query.name;

  return Extension.findAll({
    where
  })
    .then(extensions => {
      if(req.query.limit == 1 && extensions.length > 0) {
        extensions = extensions[0];
      }
      return res.json(extensions);
    })
    .catch(handleError(res));
}

export default search;
