import grpc from 'grpc';

import { getServer } from './app.server.js';

const routeServer = getServer();
console.info('Started GRPC on 50051');
routeServer.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
routeServer.start();
