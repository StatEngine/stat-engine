import request from 'request-promise';

import config from '../config/environment';
import { buildJWT } from './workspace/read-only-rest.controller';

export class KibanaApi {
  _request;

  static async connect(req, res, next) {
    if (!req.user) throw new Error('KibanaApi requires req.user to be loaded!');
    if (!req.workspace) throw new Error('KibanaApi requires req.workspace to be loaded!');
    if (!req.userWorkspace) throw new Error('KibanaApi requires req.userWorkspace to be loaded!');

    const user = req.user;
    const workspace = req.workspace;
    const userWorkspace = req.userWorkspace;

    const kibanaApi = new KibanaApi();

    // Get a new request object. This object will have its own cookie jar.
    kibanaApi._request = request.defaults({
      baseUrl: `${config.nfors.uri}`,
      headers: {
        'kbn-xsrf': 'true', // Kibana requires 'kbn-xsrf' to be set or it will return an error. It can be any string.
      },
      json: true,
      jar: request.jar(),
    });

    if(user.FireDepartment) {
      kibanaApi._request.headers = {
        'x-se-fire-department-all': user.FireDepartment.get().es_indices.all,
      };
    }

    // Start a Kibana Session on behalf of the requesting user, storing rorCookie in cookie jar.
    const rorJwt = buildJWT({
      user,
      workspace,
      userWorkspace,
    });

    try {
      await kibanaApi._request({
        uri: `login?jwt=${rorJwt}`,
      });
    } catch (err) {
      console.error(err);
      throw new Error('Failed to login to Kibana API. Make sure that Kibana is running.');
    }

    req.kibanaApi = kibanaApi;

    if (next) {
      next();
    }
  };

  get request() {
    if (!this._request) {
      throw new Error('KibanaApi has not been initialized. Make sure that KibanaApi.connect middleware has been added, or that KibanaApi.connect() has been called.');
    }

    return this._request;
  }

  get(...args) {
    return this.request.get(...args);
  }

  post(...args) {
    return this.request.post(...args);
  }

  put(...args) {
    return this.request.put(...args);
  }

  patch(...args) {
    return this.request.patch(...args);
  }

  delete(...args) {
    return this.request.delete(...args);
  }
}
