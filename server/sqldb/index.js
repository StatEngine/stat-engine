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
db.Extension = db.sequelize.import('../api/extension/extension.model');
db.ExtensionConfiguration = db.sequelize.import('../api/extension-configuration/extension-configuration.model');
db.ExtensionRequest = db.sequelize.import('../api/extension-request/extension-request.model');
db.Report = db.sequelize.import('../api/report/report.model.js');

db.FireDepartment.Users = db.FireDepartment.hasMany(db.User);

db.User.belongsTo(db.FireDepartment);
db.User.hasMany(db.ExtensionRequest);

db.Extension.hasMany(db.ExtensionConfiguration);
db.Extension.hasMany(db.ExtensionRequest);
db.FireDepartment.hasMany(db.ExtensionConfiguration);
db.ExtensionConfiguration.belongsTo(db.Extension);
db.ExtensionConfiguration.belongsTo(db.FireDepartment);
db.Report.belongsTo(db.User, { foreignKey: 'updated_by' });
db.ExtensionRequest.belongsTo(db.Extension);
db.FireDepartment.hasMany(db.Report);
//db.User.hasMany(db.Report, { foreignKey: 'updated_by' });

module.exports = db;
