'use strict';

import express from 'express';

import config from '../config/environment';
import { App, FireDepartment, User } from '../sqldb';

// Passport Configuration
require('./basic/passport').setup(User, config);
require('./api-key/passport').setup(User, config);
require('./local/passport').setup(User, FireDepartment, config);
require('./jwt-token/passport').setup(User, config);

const router = express.Router();

// Local routes
router.use('/local', require('./local').default);

export default router;
