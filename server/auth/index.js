'use strict';

import express from 'express';

import config from '../config/environment';
import {User} from '../sqldb';

// Passport Configuration
require('./basic/passport').setup(User, config);
require('./api-key/passport').setup(User, config);
require('./local/passport').setup(User, config);

const router = express.Router();

// Local routes
router.use('/local', require('./local').default);

export default router;
