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
db.ReportMetric = db.sequelize.import('../api/report-metric/report-metric.model.js');
db.App = db.sequelize.import('../api/app/app.model');
db.AppInstallation = db.sequelize.import('../api/app/app-installation.model');

db.FireDepartment.Users = db.FireDepartment.hasMany(db.User);

db.User.belongsTo(db.FireDepartment);
db.User.hasMany(db.ExtensionRequest);
db.User.hasMany(db.ReportMetric);

db.Extension.hasMany(db.ExtensionConfiguration);
db.Extension.hasMany(db.ExtensionRequest);
db.App.hasMany(db.AppInstallation);
db.FireDepartment.hasMany(db.ExtensionConfiguration);
db.FireDepartment.hasMany(db.AppInstallation);
db.ExtensionConfiguration.belongsTo(db.Extension);
db.ExtensionConfiguration.belongsTo(db.FireDepartment);
db.AppInstallation.belongsTo(db.App);
db.AppInstallation.belongsTo(db.FireDepartment);
db.Report.belongsTo(db.User, { foreignKey: 'updated_by' });
db.ReportMetric.belongsTo(db.User);
db.Report.hasMany(db.ReportMetric);

db.ExtensionRequest.belongsTo(db.Extension);
db.FireDepartment.hasMany(db.Report);
//db.User.hasMany(db.Report, { foreignKey: 'updated_by' });

module.exports = db;
