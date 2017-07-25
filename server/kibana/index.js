'use strict';

import {Router} from 'express';
import * as auth from '../auth/auth.service';

var proxy = require('express-http-proxy');
var router = new Router();
var settings = require('./kibana.settings').default;

router.all('*', auth.isAuthenticated(), proxy(settings.uri, settings));

module.exports = router;
