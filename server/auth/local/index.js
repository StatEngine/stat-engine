'use strict';

import express from 'express';
import passport from 'passport';
import bodyParser from 'body-parser';
import path from 'path';

import config from '../../config/environment';

var router = express.Router();

// Login route
router.post('/', bodyParser.json(), passport.authenticate('local'), (req, res) => {
  res.send(req.user);
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
    res.send(req.user);
  } else {
    res.send(false);
  }
});

export default router;
