'use strict';

import express from 'express';
import passport from 'passport';
import bodyParser from 'body-parser';
import path from 'path';

import config from '../../config/environment';

var router = express.Router();

// Login route
router.post('/', bodyParser.json(), (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if(err) {
      return next(err);
    }
    if(!user) {
      return res.status(401).send(info);
    }
    req.logIn(user, err => {
      if(err) {
        return next(err);
      }
      return res.send(user);
    });
  })(req, res, next);
});

// Callback logout route
// Kibana should call this on logout or from Angular on failure
router.get('/logout/_callback', (req, res) => {
  req.logout();
  res.redirect('/');
});

// Logsout of Kibana
router.get('/logout', (req, res) => {
  res.redirect(path.join(config.kibana.appPath, '/logout'));
});

// Route to determine if user is logged in
router.get('/', (req, res) => {
  if(req.isAuthenticated()) {
    let user = req.user.get();
    delete user.salt;
    delete user.password;
    delete user.api_key;
    delete user.aws_access_key_id;
    delete user.aws_secret_access_key;
    res.send(user);
  } else {
    res.send(null);
  }
});

export default router;
