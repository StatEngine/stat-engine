
import fs from 'fs';
import _ from 'lodash';
import grpc from 'grpc';

import {
  App,
  AppInstallation,
  FireDepartment,
} from '../sqldb';
import { Log } from '../util/log';

const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = `${__dirname}../../../node_modules/@statengine/se-grpc-proto/app.proto`;
const packageDefinition = protoLoader.loadSync(
  PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  }
);

const seDefinition = grpc.loadPackageDefinition(packageDefinition).statengine;

export function listApps(call, cb) {
  App.findAll({
    include: [{
      model: AppInstallation,
      include: FireDepartment,
    }]
  }).then(apps => cb(null, { apps:
    _.map(apps, app => ({
      id: app._id,
      slug: app.slug,
      name: app.name,
      webhook_url: app.webhook_url,
      webhook_secret: app.webhook_secret,
      installations: _.map(app.AppInstallations || [], i => ({
        id: i._id,
        fire_department: {
          fd_id: i.FireDepartment.fd_id,
          name: i.FireDepartment.name,
          state: i.FireDepartment.state,
          firecares_id: i.FireDepartment.firecares_id,
          timezone: i.FireDepartment.timezone,
        }
      }))
    }))}
  ))
    .catch(err => {
      Log.error(err);
      cb(err);
    });
}

export function getServer() {
  const server = new grpc.Server();
  server.addProtoService(seDefinition.AppRPC.service, {
    listApps: (call, cb) => listApps(call, cb),
  });
  return server;
}
