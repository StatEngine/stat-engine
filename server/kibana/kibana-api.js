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

  get request() {
    if (!this._request) {
      throw new Error('KibanaApi has not been initialized. Make sure that kibanaApi.connectMiddleware has been added, or that kibanaApi.connect() has been called.');
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

export default new KibanaApi();
