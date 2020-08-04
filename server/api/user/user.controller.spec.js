import { User } from '../../sqldb';
import request from '../../util/test/test-request';
import testUtil from '../../util/test/test-util';

describe('user.controller', function() {
  describe('POST /api/users', function() {
    it('creates a new user', async function() {
      expect(await User.count()).to.equal(0);

      const userData = testUtil.buildUserData();
      const response = await request.post('/api/users', userData);

      expect(response.status).to.equal(204);
      expect(await User.count()).to.equal(1);
    });

    it('fails if email already exists', async function() {
      await testUtil.createUser({
        email: 'test@test.com',
        username: 'user0',
      });

      expect(await User.count()).to.equal(1);

      const response = await request.post('/api/users', {
        email: 'test@test.com',
        username: 'user1',
      });

      expect(response.status).to.equal(422);
      expect(response.data).to.nested.include({ 'errors[0].type': 'UnprocessableEntityError' });
      expect(await User.count()).to.equal(1);
    });

    it('fails if username already exists', async function() {
      await testUtil.createUser({
        email: 'user0@test.com',
        username: 'user0',
      });

      expect(await User.count()).to.equal(1);

      const response = await request.post('/api/users', {
        email: 'user1@test.com',
        username: 'user0',
      });

      expect(response.status).to.equal(422);
      expect(response.data).to.nested.include({ 'errors[0].type': 'UnprocessableEntityError' });
      expect(await User.count()).to.equal(1);
    });
  });

  describe('GET /api/users/me', function() {
    it('returns user data when authenticated', async function() {
      const user = await testUtil.createUserWithSession();

      const response = await request.get('/api/users/me');

      expect(response.status).to.equal(200);
      expect(response.data).to.nested.include({ 'user.username': user.username });
    });

    it('fails when not authenticated', async function() {
      const response = await request.get('/api/users/me');

      expect(response.status).to.equal(401);
    });
  });
});
