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
      first_name: 'Info',
      last_name: 'Info',
      email: 'info@prominentedge.com',
      password: '(ZjViZGNmOTM4(x4'
    }, {
      provider: 'local',
      role: 'user',
      first_name: 'Richmond',
      last_name: 'User',
      email: 'richmond@prominentedge.com',
      password: 'w!Dh5m#Fg321',
      department: 'richmond',
    }, {
      provider: 'local',
      role: 'user',
      name: 'kona',
      theme: 'nfors',
      email: 'kona@prominentedge.com',
      password: 'S30@Y!$VQOh%',
      department: 'kona',
    }])
      .then(() => {
        console.log('finished populating users');
      });
  });
