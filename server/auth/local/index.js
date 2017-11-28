'use strict';

import express from 'express';
import passport from 'passport';
import bodyParser from 'body-parser';

var router = express.Router();

// Login route
router.post('/', bodyParser.json(), passport.authenticate('local'), (req, res) => {
  res.send(req.user);
});

// Logout route
router.get('/logout', (req, res) => {
  // invalidate session/logout of passport
  req.logout();
  res.redirect('/');
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
