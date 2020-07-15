'use strict';

import { User } from '../../sqldb';
import testUtil from '../../util/test/test-util';

describe('user.model', function() {
  describe('create', function() {
    it('fails if email already exists', async function() {
      const user0Data = testUtil.buildUserData({
        email: 'user0@test.com',
        username: 'user0',
      });
      await expect(User.create(user0Data)).to.be.fulfilled;

      const user1Data = testUtil.buildUserData({
        email: 'user0@test.com',
        username: 'user1',
      });

      await expect(User.create(user1Data)).to.be.rejected;
    });

    it('fails if username already exists', async function() {
      const user0Data = testUtil.buildUserData({
        email: 'user0@test.com',
        username: 'user0',
      });
      await expect(User.create(user0Data)).to.be.fulfilled;

      const user1Data = testUtil.buildUserData({
        email: 'user1@test.com',
        username: 'user0',
      });

      await expect(User.create(user1Data)).to.be.rejected;
    });

    it('fails if email is empty', async function() {
      const userData = testUtil.buildUserData({
        email: '',
      });
      await expect(User.create(userData)).to.be.rejected;
    });
  });

  describe('authentication', function() {
    let user;

    beforeEach(async function() {
      user = await testUtil.createUser();
    });

    it('succeeds if password is correct', async function() {
      expect(user.authenticate('password')).to.be.true;
    });

    it('fails if password is incorrect', async function() {
      expect(user.authenticate('incorrectpassword')).to.not.be.true;
    });
  });
});
