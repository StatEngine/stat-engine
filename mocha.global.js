import app from './';
import testUtil from './server/util/test/test-util';
import request from './server/util/test/test-request';
import { Log } from './server/util/log';

before(async function() {
  // Wait for the app to finish startup.
  await new Promise(resolve => {
    const intervalId = setInterval(() => {
      if (app.started) {
        clearInterval(intervalId);
        resolve()
      }
    }, 100);
  });

  Log.test('Running tests...\n');
});

beforeEach(async function() {
  request.init();

  // Tests should never rely on each other's state, so make sure the database
  // is clear before every test.
  await testUtil.clearDatabase();
});
