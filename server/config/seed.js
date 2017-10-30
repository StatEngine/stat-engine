/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import sqldb from '../sqldb';
var User = sqldb.User;

User.sync()
  .then(() => User.destroy({ where: {} }))
  .then(() => {
    User.bulkCreate([{
      provider: 'local',
      role: 'admin',
      name: 'Nunya',
      email: 'info@prominentedge.com',
      password: '(ZjViZGNmOTM4(x4'
    }])
      .then(() => {
        console.log('finished populating users');
      });
  });
