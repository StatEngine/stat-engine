import { User } from '../../sqldb';
import request from './test-request';
import { Log } from '../log';

class TestUtil {
  buildUserData(customData) {
    return {
      provider: 'local',
      role: 'user',
      first_name: 'Firstname',
      last_name: 'Lastname',
      username: 'username',
      email: 'user@test.com',
      password: 'password',
      nfors: true,
      api_key: 'apiKey',
      aws_access_key_id: 'awsKey',
      aws_secret_access_key: 'awsSecret',
      ...customData,
    };
  }

  async createUser(customData) {
    const userData = this.buildUserData(customData);
    return User.create(userData);
  }

  async createUserWithSession() {
    const userData = this.buildUserData();
    const user = await this.createUser(userData);
    const response = await request.createSession(userData);
    Log.test('response.data', response.data);
    return user;
  }

  clearUsers() {
    return User.destroy({ where: {} });
  }

  clearDatabase() {
    return this.clearUsers();
  }
}

export default new TestUtil();
