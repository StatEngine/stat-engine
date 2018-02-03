import async from 'async';
import Twitter from 'twitter';

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

export function update(req, res) {
  if (req.query.action === 'tweet') {
    return tweet(req, res)
  } else if (req.query.action === 'edit') {
    return edit(req, res)
  } else {
    return res.send('400').end();
  }
}

function edit(req, res) {
  return Tweet.find({
    where: {
      _id: req.params.id
    }
  }).then(dbTweet => {
    if (!dbTweet) return res.status(500).end({ msg: 'Could not find tweet'});

    dbTweet.tweet_json = req.body.tweet_json;
    dbTweet.date_updated = Date.now();
    dbTweet.updated_by = req.user.username;

      return dbTweet.save()
      .then((updatedTweet) => {
        return res.status(200).json(updatedTweet);
      })
      .catch(validationError(res));
  });
}

function tweet(req, res) {
  // Post to twitter
  // get twitter api info
  const client = new Twitter({
    consumer_key: 'cvdJKaUTfGrcspoIlX8dxakRw',
    consumer_secret: 'ICoyiZHguN4nRpKaY1H3FsZ800LCpxYFVKO6mI1FuXx2FXeQG1',
    access_token_key: '941371673726484480-mKsT1fBibKS8j4E3GDGm2FTNzWhw9rH',
    access_token_secret: 'y5Kq54mYETzd8qj8Oo9mu2DtfNEPpC9mhvplD4KqK7g9c'
  });

  req.body.tweet_json.status += ' #PoweredByStatEngine';
  client.post('statuses/update', req.body.tweet_json, (error, tweet, response) => {
    let status = 'TWEETED'

    if (error) {
      status = 'FAILED';
    }

    return Tweet.find({
      where: {
        _id: req.params.id
      }
    }).then(dbTweet => {
      if (!dbTweet) return res.status(500).end({ msg: 'Could not find tweet'});

      dbTweet.status = status;
      dbTweet.response_json = error || tweet;
      dbTweet.tweeted_by = req.user.username;

      if (tweet) dbTweet.date_tweeted = tweet.created_at;
      return dbTweet.save()
        .then(() => {
          if (status !== 'FAILED') {
            return res.status(200).json(dbTweet);
          } else {
            return res.status(500).json(dbTweet)
          }
        })
        .catch(validationError(res));
    });
  });
}
