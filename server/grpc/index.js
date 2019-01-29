import grpc from 'grpc';

import { getServer } from './app.server.js';

const routeServer = getServer();
routeServer.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
routeServer.start();
