import async from 'async';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import Twitter from 'twitter';

import { createCanvas, Image } from 'canvas';

import config from '../../config/environment';
import { Tweet } from '../../sqldb';

import { runAllQueries } from './twitter-queries.controller';

const MEDIA_BASE_PATH = '../../../client/assets/images/twitter-media';

function prepareMedia(tweet, dataURL, cb) {
  if (!tweet.media_path) return cb(null, null);

  const fullMediaPath = path.join(__dirname, MEDIA_BASE_PATH, tweet.media_path);

  fs.readFile(fullMediaPath, (err, data) => {
    if(err) return cb(err, null);
    const img = new Image();

    const width = 1200 / 1.2;
    const height = 627 / 1.2;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    img.src = data;

    ctx.drawImage(img, 0, 0, width, height);
    ctx.textAlign = 'center';
    ctx.font = '800 48px Montserrat, Open Sans, Impact, Arial';
    ctx.fillStyle = 'white';

    if (tweet.media_text) ctx.fillText(tweet.media_text, width / 2, height / 2);

    if(dataURL) return cb(null, canvas.toDataURL());
    return cb(null, canvas.toBuffer());
  });
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    return res.status(statusCode).send(err);
  };
}

export function mediaSearch(req, res) {
  fs.readdir(path.join(__dirname, MEDIA_BASE_PATH), (err, files) => {
    if(err) return res.status(500).end();

    let media = [];
    files.forEach(file => media.push({
      id: file,
      path: file,
    }));

    res.json(_.sortBy(media, m => m.id));
  });
}

export function recommendations(req, res) {
  if(req.query.media) {
    return mediaSearch(req, res);
  }

  const fireIncidentIndex = req.user.FireDepartment.es_indices['fire-incident'];

  runAllQueries({
    index: fireIncidentIndex,
    name: req.user.FireDepartment.name,
  }, (err, tweets) => {
    if(err) {
      return res.status(500).end();
    }

    if(!tweets) {
      return res.status(404).end();
    }

    let recTweets = [];
    tweets.forEach(tweet => recTweets.push({
      fire_department__id: req.user.FireDepartment._id,
      tweet_json: {
        status: tweet,
      },
    }))

    return res.json(recTweets);
  });
}

export function preview(req, res) {
  let tweet = req.body;
  prepareMedia(tweet, true, (err, buf) => {
    if(err) tweet.media_url = '';
    else tweet.media_url = buf;

    return res.json(tweet);
  })
}

export function tweet(req, res) {
  const auth = {
    consumer_key: config.twitter.consumerKey,
    consumer_secret: config.twitter.consumerSecret,
    access_token_key: req.session.twitter.userToken,
    access_token_secret: req.session.twitter.userTokenSecret,
  };

  const client = new Twitter(auth);

  let tweet = req.body;

  async.waterfall([
    done => prepareMedia(tweet, false, done),
    (mediaData, done) => {
      if (mediaData) return client.post('media/upload', { media: mediaData }, done);
      else return done(null, null, null);
    },
    (media, mediaResponse, done) => {
      if (media) tweet.tweet_json.media_ids = media.media_id_string;
      client.post('statuses/update', tweet.tweet_json, (error, apiTweet, apiResponse) => {
        done(null, error, apiTweet, apiResponse);
      });
    },
  ], (err, apiTweet, apiResponse) => {
    if(err) {
      console.error(err);
      return res.status(500).end();
    }
    else if (apiResponse.errors) {
      return res.status(500).send(apiResponse.errors);
    }
    res.status(200).json(apiResponse);
  });
}

export function recent(req, res) {
  const auth = {
    consumer_key: config.twitter.consumerKey,
    consumer_secret: config.twitter.consumerSecret,
    access_token_key: req.session.twitter.userToken,
    access_token_secret: req.session.twitter.userTokenSecret,
  };

  const client = new Twitter(auth);

  client.get('statuses/user_timeline', (err, timeline, response) => {
    if (err) {
      console.error(err);
      return res.status(500).send();
    }
    return res.json(timeline);
  });
}
