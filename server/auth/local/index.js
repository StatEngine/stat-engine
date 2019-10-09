'use strict';

import express from 'express';
import passport from 'passport';
import bodyParser from 'body-parser';
import path from 'path';

import config from '../../config/environment';
import { InternalServerError, UnauthorizedError } from '../../util/error';

const router = express.Router();

// Login route
router.post('/', bodyParser.json(), (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if(err) {
      return next(new InternalServerError(err.message));
    }
    if(!user) {
      return next(new UnauthorizedError(info));
    }
    req.logIn(user, err => {
      if(err) {
        return next(new InternalServerError(err.message));
      }
      const u = user.get();
      delete u.salt;
      delete u.password;

      let redirect;
      if(req.session.returnTo) {
        redirect = req.session.returnTo;
        delete req.session.returnTo;
      }

      return res.send({
        user: u,
        redirect
      });
    });
  })(req, res, next);
});

// Logsout of Kibana
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
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
    res.send({ user });
  } else {
    res.send({});
  }
});

export default router;
