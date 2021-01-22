/**
 * Main application file
 */


'use strict';

import 'babel-polyfill';
import 'express-async-errors';
import express from 'express';
import http from 'http';
import 'regenerator-runtime/runtime';
// import later from '@breejs/later';

import sqldb from './sqldb';
import config from './config/environment';
import { Log } from './util/log';
// import CustomEmailScheduler from './lib/customEmails/customEmailScheduler';

// Setup server
var app = express();
var server = http.createServer(app);
/*var socketio = require('socket.io')(server, {
  serveClient: config.env !== 'production',
  path: '/socket.io-client'
});
require('./config/socketio').default(socketio);*/
require('./config/express').default(app);
require('./routes').default(app);
require('./grpc');




// Start server
async function startServer() {
  app.angularFullstack = server.listen(config.port, config.ip, function() {
    Log.info(`Express server listening on ${config.port}, in ${app.get('env')} mode`);
  });

  // CustomEmailScheduler.scheduleCustomEmails();

  // when this container starts up, we want to run scheduleAll on the days that daylight
  // savings time starts and ends
  // daylight savings time starts on the second Sunday of March
  // const startDstSchedule = later.parse.recur().on(3).month().on(2)
  //   .weekOfMonth()
  //   .on(1)
  //   .hour();
  // daylight savings time ends on the first Sunday of November
  // const endDstSchedule = later.parse.recur().on(11).month().on(1)
  //   .weekOfMonth()
  //   .on(1)
  //   .dayOfWeek()
  //   .on(1)
  //   .hour();

  // we want to reschedule on start and end of DST
  // later.setInterval(CustomEmailScheduler.scheduleCustomEmails, startDstSchedule);
  // later.setInterval(CustomEmailScheduler.scheduleCustomEmails, endDstSchedule);
}

sqldb.sequelize.sync()
  .then(startServer)
  .catch(function(err) {
    Log.error('Server failed to start due to an error...');
    Log.error(err);
  });

// Expose app
module.exports = app;
