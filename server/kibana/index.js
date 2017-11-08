'use strict';

import {Router} from 'express';
import * as auth from '../auth/auth.service';
import settings from './kibana.settings';

const proxy = require('http-proxy-middleware');

const router = new Router();

router.use('*', auth.isAuthenticated(), proxy(settings));

module.exports = router;
