'use strict';

import {Router} from 'express';

import * as controller from './ingest.controller';
import * as auth from '../../auth/auth.service';
import config from '../../config/environment';
import bodyParser from 'body-parser';

var router = new Router();

// Generic route to handle all types.... e.g.
// fire-incident/
// vehicle-telemetry/
//
if(config.on_premise) {
  const rawParser = bodyParser.raw();

  router.put('/:type/',
    auth.hasRole('ingest'),
    auth.hasFireDepartment,
    controller.setAMQPRouting,
    rawParser,
    controller.queue);

  router.delete('/:type/',
    auth.hasRole('ingest'),
    auth.hasFireDepartment,
    controller.setAMQPRouting,
    controller.queue);
}
module.exports = router;
