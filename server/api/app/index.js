'use strict';

import { Router } from 'express';

import * as auth from '../../auth/auth.service';
import jwt from 'jsonwebtoken';

const router = new Router();

const hello = (req, res) => {
  res.send('Hello')
};

const token = (req, res) => {
  const body = { _id : '123' };

  // Sign the JWT token and populate the payload with the user email and id
  const token = jwt.sign({ user : body }, 'top_secret');
  // Send back the token to the user
  return res.json({ token });
};

router.get(
  '/installations/access_tokens',
  auth.checkOauthJwt,
  token,
);

router.get(
  '/installations',
  auth.checkOauthJwt,
  hello,
);

router.get(
  '/',
  auth.checkOauthJwt,
  hello,
);




module.exports = router;
