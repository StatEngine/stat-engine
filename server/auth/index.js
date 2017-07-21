'use strict';
import express from 'express';
import config from '../config/environment';
import {User} from '../sqldb';

// Passport Configuration
require('./local/passport').setup(User, config);
require('./google/passport').setup(User, config);

var router = express.Router();

router.use('/local', require('./local').default);
router.use('/google', require('./google').default);

export default router;
