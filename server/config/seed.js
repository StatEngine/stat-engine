/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import sqldb from '../sqldb';
const User = sqldb.User;
const FireDepartment = sqldb.FireDepartment;


User
  .sync()
  .then(() => User.destroy({ where: {} }))
  .then(() => FireDepartment.sync())
  .then(() => FireDepartment.destroy({ where: {} }))
  .then(() => FireDepartment.create({
    fd_id: '76000',
    name: 'Richmond Fire and Emergency Services',
    state: 'VA',
    timezone: 'US/Eastern',
    Users: [{
      provider: 'local',
      role: 'kibana_ro',
      first_name: 'Richmond',
      last_name: 'User',
      email: 'richmond@prominentedge.com',
      password: 'password',
    }]
  }, {
    include: FireDepartment.Users
  }))
  .then(() => FireDepartment.create({
    fd_id: '08500',
    name: 'Hanover Fire-EMS',
    state: 'VA',
    timezone: 'US/Eastern',
    Users: [{
      provider: 'local',
      role: 'user',
      first_name: 'Hanover',
      last_name: 'User',
      email: 'hanover@prominentedge.com',
      password: 'password',
    }]
  }, {
    include: FireDepartment.Users
  }))
  .then(() => console.log('finished populating fire departments + users'));
