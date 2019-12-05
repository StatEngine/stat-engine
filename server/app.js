/**
 * Main application file
 */


'use strict';

import 'babel-polyfill';
import 'express-async-errors';
import express from 'express';
import http from 'http';

import sqldb from './sqldb';
import config from './config/environment';
import { Log } from './util/log';

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
function startServer() {
  app.angularFullstack = server.listen(config.port, config.ip, function() {
    Log.info(`Express server listening on ${config.port}, in ${app.get('env')} mode`);
  });
}

sqldb.sequelize.sync()
  .then(startServer)
  .catch(function(err) {
    Log.error('Server failed to start due to an error...');
    Log.error(err);
  });

// Expose app
module.exports = app;
