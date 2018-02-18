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
db.Tweet = db.sequelize.import('../api/twitter/tweet.model');
db.Extension = db.sequelize.import('../api/extension/extension.model');
db.ExtensionConfiguration = db.sequelize.import('../api/extension-configuration/extension-configuration.model');

// Move to relations file
db.FireDepartment.Users = db.FireDepartment.hasMany(db.User);
db.FireDepartment.Tweets = db.FireDepartment.hasMany(db.Tweet);

db.Tweet.belongsTo(db.FireDepartment);

db.Extension.hasMany(db.ExtensionConfiguration);
db.FireDepartment.hasMany(db.ExtensionConfiguration);
db.ExtensionConfiguration.belongsTo(db.Extension);
db.ExtensionConfiguration.belongsTo(db.FireDepartment);

module.exports = db;
