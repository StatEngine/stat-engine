import LoginWithTwitter from 'login-with-twitter';
import Twitter from 'twitter';

import config from '../../config/environment';
import { InternalServerError, UnauthorizedError } from '../../util/error';

const tw = new LoginWithTwitter({
  consumerKey: config.twitter.consumerKey,
  consumerSecret: config.twitter.consumerSecret,
  callbackUrl: config.twitter.callbackUrl,
});

export function login(req, res) {
  tw.login((err, secret, url) => {
    if(err) {
      throw new InternalServerError(err.message);
    }

    // save request secret in session
    req.session.twitterRequestSecret = secret;

    // redirect user to twitters
    res.send(url);
  });
}

export function loginCallback(req, res) {
  if(!req.session.twitterRequestSecret) {
    throw new InternalServerError('No twitterRequestSecret found in session');
  }

  tw.callback(req.query, req.session.twitterRequestSecret, (err, data) => {
    if(err) {
      throw new InternalServerError(err.message);
    }

    /*
      data = {
        userName: ...,
        userId: ...,
        userToken: ...,
        userTokenSecret: ...
      }
    */
    req.session.twitter = data;
    res.redirect('/twitter');
  });
}

export function profile(req, res) {
  if(!req.session.twitter) throw new UnauthorizedError('twitter not found in session')

  const auth = {
    consumer_key: config.twitter.consumerKey,
    consumer_secret: config.twitter.consumerSecret,
    access_token_key: req.session.twitter.userToken,
    access_token_secret: req.session.twitter.userTokenSecret,
  };

  const client = new Twitter(auth);

  client.get('account/verify_credentials', (err, response) => {
    if(err) {
      delete req.session.twitter;
      throw new UnauthorizedError(err.message)
    } else {
      res.send(response);
    }
  });
}
