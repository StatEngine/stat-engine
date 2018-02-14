/**
 * Sequelize initialization module
 */

'use strict';

import Sequelize from 'sequelize';

import config from '../config/environment';

var db = {
  Sequelize,
  sequelize: new Sequelize(config.sequelize.uri, config.sequelize.options)
};

// Insert models below
db.User = db.sequelize.import('../api/user/user.model');
db.FireDepartment = db.sequelize.import('../api/fire-department/fire-department.model');

// Move to relations file
db.FireDepartment.Users = db.FireDepartment.hasMany(db.User);

module.exports = db;
