/**
 * Express configuration
 */

'use strict';

import express from 'express';
import favicon from 'serve-favicon';
import morgan from 'morgan';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import errorHandler from 'errorhandler';
import path from 'path';
import lusca from 'lusca';
import passport from 'passport';
import session from 'express-session';
import connectSessionSequelize from 'connect-session-sequelize';
import compression from 'compression';

import config from './environment';
import sqldb from '../sqldb';
import { Log } from '../util/log';

const SequelizeStore = connectSessionSequelize(session.Store);

export default function(app) {
  var env = app.get('env');

  //app.use(helmet());
  app.use(compression());

  if(env === 'development' || env === 'test') {
    app.use(express.static(path.join(config.root, '.tmp')));
  }

  if(env === 'production') {
    app.use(favicon(path.join(config.root, 'client', 'favicon.ico')));
  }

  app.disable('x-powered-by');

  app.set('appPath', path.join(config.root, 'client'));
  app.use(express.static(app.get('appPath'), { maxAge: '365d' }));
  app.use(morgan('dev'));

  app.set('views', `${config.root}/server/views`);
  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');
  app.use(methodOverride());
  app.use(cookieParser());

  // Setup sessions
  const myStore = new SequelizeStore({
    db: sqldb.sequelize
  });
  // https://www.npmjs.com/package/express-session
  let sess = {
    secret: config.session.secret,
    saveUninitialized: true,
    resave: false,
    store: myStore,
    // since we do SSL outside of node
    proxy: true,
    // 30 days in ms
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 30,
      secure: false,
    },
  };

  if(process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1); // trust first proxy
    sess.cookie.secure = config.session.secure; // serve secure cookies
  }
  app.use(session(sess));
  myStore.sync();

  // Setup passport
  app.use(passport.initialize());
  app.use(passport.session());

  /**
   * Lusca - express server security
   * https://github.com/krakenjs/lusca
   */
  if(env !== 'test') {
    app.use(lusca({
      // globally at false (so we can have external api users)
      // but enable later on route bootstrapping for individual routes
      csrf: false,
      xframe: 'SAMEORIGIN',
      hsts: {
        maxAge: 31536000, //1 year, in seconds
        includeSubDomains: true,
        preload: true
      },
      xssProtection: true
    }));
  }

  if(env === 'development') {
    const webpackDevMiddleware = require('webpack-dev-middleware');
    const stripAnsi = require('strip-ansi');
    const webpack = require('webpack');
    const makeWebpackConfig = require('../../webpack.make');
    const webpackConfig = makeWebpackConfig({ DEV: true });
    const compiler = webpack(webpackConfig);
    const browserSync = require('browser-sync').create();

    /**
     * Run Browsersync and use middleware for Hot Module Replacement
     */
    browserSync.init({
      open: false,
      logFileChanges: false,
      proxy: `localhost:${config.port}`,
      ws: true,
      middleware: [
        webpackDevMiddleware(compiler, {
          noInfo: false,
          stats: {
            colors: true,
            timings: true,
            chunks: false
          }
        })
      ],
      port: config.browserSyncPort,
      plugins: ['bs-fullscreen-message']
    });

    /**
     * Reload all devices when bundle is complete
     * or send a fullscreen error message to the browser instead
     */
    compiler.plugin('done', function(stats) {
      Log.info('webpack done hook');
      if(stats.hasErrors() || stats.hasWarnings()) {
        return browserSync.sockets.emit('fullscreen:message', {
          title: 'Webpack Error:',
          body: stripAnsi(stats.toString()),
          timeout: 100000
        });
      }
      browserSync.reload();
    });
  }

  if(env === 'development' || env === 'test') {
    app.use(errorHandler()); // Error handler - has to be last
  }
}
