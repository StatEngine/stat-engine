'use strict';

import { Router } from 'express';

const router = new Router();

router.use('/first-arriving', require('./first-arriving'));
router.use('/firecares', require('./firecares'));

module.exports = router;
