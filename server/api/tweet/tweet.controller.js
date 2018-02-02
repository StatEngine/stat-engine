import { Tweet } from '../../sqldb';

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
 * Creates a new fire department
 */
export function create(req, res) {
  var newTweet= Tweet.build(req.body);

  return newTweet.save()
    .then(function(tweet) {
      res.json(tweet);
    })
    .catch(validationError(res));
}

export function destroy(req, res) {
  return Tweet.destroy({
    where: {
      _id: req.params.id,
      fire_department__id: req.fire_department._id
    }})
    .then(function() {
      res.status(204).end();
    })
    .catch(handleError(res));
}

export function search(req, res) {
  return Tweet.findAll({
    where: {
      fire_department__id: req.fire_department._id
    }
  })
    .then(tweets => {
      if(!tweets) {
        return res.status(404).end();
      }
      return res.json(tweets);
    })
    .catch(validationError(res));
}
