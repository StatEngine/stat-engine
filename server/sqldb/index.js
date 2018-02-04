/**
 * Sequelize initialization module
 */
'use strict';

import config from '../config/environment';
import Sequelize from 'sequelize';

var db = {
  Sequelize,
  sequelize: new Sequelize(config.sequelize.uri, config.sequelize.options)
};

// Insert models below
db.User = db.sequelize.import('../api/user/user.model');
db.FireDepartment = db.sequelize.import('../api/fire-department/fire-department.model');
db.Tweet = db.sequelize.import('../api/tweet/tweet.model');
db.ExtensionConfiguration = db.sequelize.import('../api/extension-configuration/extension-configuration.model');

// Move to relations file
db.FireDepartment.Users = db.FireDepartment.hasMany(db.User);
db.FireDepartment.Tweets = db.FireDepartment.hasMany(db.Tweet);
db.FireDepartment.ExtensionConfigurations = db.FireDepartment.hasMany(db.ExtensionConfiguration);

module.exports = db;
