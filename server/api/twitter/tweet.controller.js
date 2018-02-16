import async from 'async';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import Twitter from 'twitter';
import { createCanvas, Image } from 'canvas';

import config from '../../config/environment';
import { Tweet } from '../../sqldb';

function prepareMedia(mediaPath, text, dataURL, cb) {
  const fullMediaPath = path.join(__dirname, '../../../client/assets/twitter-media', mediaPath);

  fs.readFile(fullMediaPath, (err, data) => {
    if(err) return cb(err);
    const img = new Image();

    const width = 1200 / 2;
    const height = 627 / 2;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    img.src = data;
    ctx.drawImage(img, 0, 0, width, height);
    ctx.textAlign = 'center';
    ctx.font = "48px Impact";
    ctx.fillStyle = 'white';

    ctx.fillText(text, width / 2, height / 2);

    if(dataURL) return cb(null, canvas.toDataURL());
    return cb(null, canvas.toBuffer());
  });
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    console.error(err);
    return res.status(statusCode).send(err);
  };
}

export function create(req, res) {
  var newTweet = Tweet.build(req.body);

  return newTweet.save()
    .then(dbTweet => {
      res.json(dbTweet);
    })
    .catch(handleError(res));
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

export function mediaSearch(req, res) {
  fs.readdir(path.join(__dirname, '../../../client/assets/twitter-media'), (err, files) => {
    if(err) return res.status(500).end();

    let media = [];
    files.forEach(file => media.push({
      id: file,
      path: path.join('../assets/twitter-media', file),
    }));

    res.json(_.sortBy(media, m => m.id));
  });
}

export function search(req, res) {
  if(req.query.media) {
    return mediaSearch(req, res);
  }

  return Tweet.findAll({
    where: {
      fire_department__id: req.fire_department._id
    },
    order: [
      ['date_created', 'DESC'],
    ],
    limit: 5
  })
    .then(tweets => {
      if(!tweets) {
        return res.status(404).end();
      }
      return res.json(tweets);
    })
    .catch(handleError(res));
}

export function update(req, res) {
  if(req.query.action === 'tweet') {
    return tweet(req, res);
  } else if(req.query.action === 'edit') {
    return edit(req, res);
  } else {
    return res.send('400').end();
  }
}

export function get(req, res) {
  return Tweet.find({
    where: {
      _id: req.params.id,
      fire_department__id: req.fire_department._id,
    }
  })
    .then(dbTweet => {
      if(!dbTweet) return res.status(500).end({ msg: 'Could not find tweet'});

      const tweetObj = dbTweet.get();

      prepareMedia(tweetObj.media_path, req.extensionConfiguration.config_json.media_text, true, (err, buf) => {
        if(err) tweetObj.media_url = '';
        else tweetObj.media_url = buf;

        return res.json(tweetObj);
      });
    })
    .catch(handleError(res));
}

function edit(req, res) {
  return Tweet.find({
    where: {
      _id: req.params.id,
      fire_department__id: req.fire_department._id,
    }
  })
    .then(dbTweet => {
      if(!dbTweet) return res.status(500).end({ msg: 'Could not find tweet'});

      dbTweet.media_path = req.body.media_path;
      dbTweet.tweet_json = req.body.tweet_json;
      dbTweet.date_updated = Date.now();
      dbTweet.updated_by = req.user.username;

      return dbTweet.save()
        .then(updatedTweet => res.status(200).json(updatedTweet))
        .catch(handleError(res));
    })
    .catch(handleError(res));
}

function tweet(req, res) {
  const auth = {
    consumer_key: config.twitter.consumerKey,
    consumer_secret: config.twitter.consumerSecret,
    access_token_key: req.session.twitter.userToken,
    access_token_secret: req.session.twitter.userTokenSecret,
  };

  const client = new Twitter(auth);

  async.waterfall([
    done => prepareMedia(req.body.media_path, req.extensionConfiguration.config_json.media_text, false, done),
    (mediaData, done) => client.post('media/upload', { media: mediaData }, done),
    (media, mediaResponse, done) => {
      req.body.tweet_json.media_ids = media.media_id_string;
      client.post('statuses/update', req.body.tweet_json, (error, apiTweet, apiResponse) => {
        done(null, error, apiTweet, apiResponse);
      });
    },
    (error, apiTweet, response, done) => {
      Tweet.find({
        where: {
          _id: req.params.id,
          fire_department__id: req.fire_department._id,
        }
      }).nodeify((err, dbTweet) => {
        if(err) return done(err);
        if(!dbTweet) return done({ msg: 'Could not find tweet'});

        let status = 'TWEETED';
        if(error) {
          status = 'FAILED';
        }

        dbTweet.status = status;
        dbTweet.response_json = error || apiTweet;
        dbTweet.tweeted_by = req.user.username;

        if(apiTweet) dbTweet.date_tweeted = apiTweet.created_at;
        dbTweet.save().nodeify(done);
      });
    }
  ], (err, dbTweet) => {
    if (err) {
      console.error(err);
      return res.status(500).end();
    }

    let resCode = 200;
    if(dbTweet.status === 'FAILED') resCode = 500;
    res.status(resCode).json(dbTweet);
  });
}
