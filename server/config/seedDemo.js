/**
 * Populate DB with data for demo
 */


'use strict';

import uuidv4 from 'uuid/v4';

import sqldb from '../sqldb';

const User = sqldb.User;
const FireDepartment = sqldb.FireDepartment;

export default function seedDemo() {
  console.info('Seeding demo data...');

  return User.sync()
    .then(() => FireDepartment.sync())
    .then(() => FireDepartment.destroy({ where: {} }))
    .then(() => User.destroy({ where: {} }))
    .then(() => FireDepartment.create({
      fd_id: '38005',
      firecares_id: '94264',
      name: 'San Francisco Fire Department',
      state: 'CA',
      timezone: 'US/Pacific',
      integration_verified: true,
      integration_complete: true,
      latitude: 37.7749,
      longitude: -122.4194,
      Users: [{
        provider: 'local',
        role: 'user,dashboard_user',
        username: 'sfUser',
        first_name: 'Demo',
        last_name: 'User',
        email: 'sfUser@example.com',
        password: 'password',
        api_key: 'sfUser',
      }, {
        provider: 'local',
        role: 'admin',
        username: 'sfAdmin',
        first_name: 'Demo',
        last_name: 'Admin',
        email: 'sfAdmin@example.com',
        password: 'password',
        api_key: 'sfAdmin',
      }, {
        provider: 'local',
        role: 'ingest',
        username: 'sfIngest',
        first_name: 'Demo',
        last_name: 'Ingest',
        email: 'sfIngest@example.com',
        password: 'password',
        api_key: 'sfIngest',
        aws_access_key_id: '',
        aws_secret_access_key: '',
      }]
    }, {
      include: [FireDepartment.Users]
    }))
    .then(() => FireDepartment.create({
      fd_id: '03050',
      firecares_id: '77989',
      name: 'Clark County Fire Department',
      state: 'NV',
      timezone: 'US/Pacific',
      integration_complete: true,
      latitude: 37.7772,
      longitude: -77.5161,
      Users: [{
        provider: 'local',
        role: 'user,department_admin',
        username: 'clarkcounty',
        first_name: 'clarkcounty',
        last_name: 'User',
        email: 'clarkcounty@prominentedge.com',
        password: 'password',
        api_key: uuidv4(),
      }],
    }, {
      include: [FireDepartment.Users]
    }))
    // .then(fireDepartment => {
    //   const locals = {
    //     FireDepartment: fireDepartment.get(),
    //   };
    //   seedIndexTemplates({}, locals, err => {
    //     if(err) throw err;
    //
    //     seedKibanaAll({}, locals, err => {
    //       if(err) throw err;
    //     });
    //   });
    // })
    .then(() => console.log('Finished seeding demo data'));
}
