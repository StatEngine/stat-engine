import axios from 'axios';
import axiosCookieJarSupport from 'axios-cookiejar-support';
import tough from 'tough-cookie';

import config from '../../config/environment';

class TestRequest {

  axiosInstance;

  init() {
    this.axiosInstance = axios.create({
      baseURL: `http://${config.ip}:${config.port}`,
    });

    // Setup axios cookies.
    axiosCookieJarSupport(this.axiosInstance);
    this.axiosInstance.defaults.jar = new tough.CookieJar();
    this.axiosInstance.defaults.withCredentials = true;
  }

  async createSession({ username, password }) {
    return this.request({
      method: 'post',
      url: '/auth/local',
      data: {
        username,
        password,
      },
    });
  }

  async get(url) {
    return this.request({
      method: 'get',
      url,
    });
  }

  async put(url, data) {
    return this.request({
      method: 'put',
      url,
      data,
    });
  }

  async post(url, data) {
    return this.request({
      method: 'post',
      url,
      data,
    });
  }

  async request({ method, url, data }) {
    try {
      return await this.axiosInstance({
        method,
        url,
        data,
      });
    } catch (err) {
      if (err.response) {
        return err.response;
      } else {
        throw err;
      }
    }
  }

}

export default new TestRequest();
