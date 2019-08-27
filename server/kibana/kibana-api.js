import request from 'request-promise';

import config from '../config/environment';
import { buildJWT } from './workspace/read-only-rest.controller';

export class KibanaApi {
  _request;

  connectMiddleware = async (req, res, next) => {
    await this.connect(req, res);
    next();
  };

  async connect(req, res) {
    if (!req.user) throw new Error('KibanaApi requires req.user to be loaded!');
    if (!req.workspace) throw new Error('KibanaApi requires req.workspace to be loaded!');
    if (!req.userWorkspace) throw new Error('KibanaApi requires req.userWorkspace to be loaded!');

    const user = req.user;
    const workspace = req.workspace;
    const userWorkspace = req.userWorkspace;

    // Get a new request object. This object will have its own cookie jar.
    this._request = request.defaults({
      baseUrl: `${config.kibana.uri}`,
      headers: {
        'kbn-xsrf': 'reporting',
      },
      json: true,
      jar: request.jar(),
    });

    // KibanaApi should not be shared between endpoints, so make sure we do cleanup after the response is sent.
    res.on('finish', () => {
      this._request = null;
    });

    if(user.FireDepartment) {
      this._request.headers = {
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
      await this._request({
        uri: `login?jwt=${rorJwt}`,
      });
    } catch (err) {
      throw new Error('Failed to login to Kibana API. Make sure that Kibana is running.');
    }
  };

  request(options) {
    if (!this._request) {
      throw new Error('KibanaApi has not been initialized. Make sure that kibanaApi.connectMiddleware has been added, or that kibanaApi.connect() has been called.');
    }

    return this._request(options);
  }

  get(options) {
    options.method = 'GET';
    return this.request(options);
  }

  post(options) {
    options.method = 'POST';
    return this.request(options);
  }

  put(options) {
    options.method = 'PUT';
    return this.request(options);
  }

  patch(options) {
    options.method = 'PATCH';
    return this.request(options);
  }

  delete(options) {
    options.method = 'DELETE';
    return this.request(options);
  }
}

export default new KibanaApi();
