// import app from '../..';
// import { User } from '../../sqldb';
//
// let user;
// const genUser = function() {
//   user = User.build({
//     provider: 'local',
//     name: 'Fake User',
//     email: 'test@example.com',
//     password: 'password',
//   });
//   return user;
// };

/**
 * These are integration tests requiring setting up SEQUELIZE_URI env variable
 */
// describe('User Model', () => {
//   before(() => {
//     // Sync and clear users before testing
//     return User.sync().then(() => {
//       return User.destroy({ where: {} });
//     });
//   });
//
//   beforeEach(() => {
//     genUser();
//   });
//
//   afterEach(() => {
//     return User.destroy({ where: {} });
//   });
//
//   it('should begin with no users', () => {
//     return expect(User.findAll()).to
//       .eventually.have.length(0);
//   });
//
//   it('should fail when saving a duplicate user', () => {
//     return expect(user.save()
//       .then(() => {
//         const userDup = genUser();
//         return userDup.save();
//       })).to.be.rejected;
//   });
//
//   describe('#email', () => {
//     it('should fail when saving without an email', () => {
//       user.email = '';
//       return expect(user.save()).to.be.rejected;
//     });
//   });
//
//   describe('#password', () => {
//     beforeEach(() => {
//       return user.save();
//     });
//
//     it('should authenticate user if valid', () => {
//       expect(user.authenticate('password')).to.be.true;
//     });
//
//     it('should not authenticate user if invalid', () => {
//       expect(user.authenticate('blah')).to.not.be.true;
//     });
//
//     it('should remain the same hash unless the password is updated', () => {
//       user.name = 'Test User';
//       return expect(user.save()
//         .then(u => {
//           return u.authenticate('password');
//         })).to.eventually.be.true;
//     });
//   });
// });
