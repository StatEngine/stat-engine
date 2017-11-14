'use strict';

import crypto from 'crypto';
var authTypes = ['github', 'twitter', 'facebook', 'google'];

var validatePresenceOf = function(value) {
  return value && value.length;
};

export default function(sequelize, DataTypes) {
  var User = sequelize.define('User', {

    _id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    first_name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    },
    last_name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING,
      unique: {
        msg: 'The specified email address is already in use.'
      },
      validate: {
        isEmail: true
      }
    },
    theme: {
      type: DataTypes.STRING,
      defaultValue: 'statengine'
    },
    department: DataTypes.STRING,
    role: {
      type: DataTypes.STRING,
      defaultValue: 'user'
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    },
    provider: DataTypes.STRING,
    salt: DataTypes.STRING,
    google: DataTypes.JSON,
    github: DataTypes.JSON

  }, {

    /**
     * Virtual Getters
     */
    getterMethods: {
      // Public profile information
      profile() {
        return {
          name: this.first_name + this.last_name,
          role: this.role
        };
      },

      // Non-sensitive info we'll be putting in the token
      token() {
        return {
          _id: this._id,
          role: this.role
        };
      }
    },

    /**
     * Pre-save hooks
     */
    hooks: {
      beforeBulkCreate(users, fields, fn) {
        var totalUpdated = 0;
        users.forEach(user => {
          user.email = user.email.toLowerCase();
          user.updatePassword(err => {
            if(err) {
              return fn(err);
            }
            totalUpdated += 1;
            if(totalUpdated === users.length) {
              return fn();
            }
          });
        });
      },
      beforeCreate(user, fields, fn) {
        user.email = user.email.toLowerCase();
        user.updatePassword(fn);
      },
      beforeUpdate(user, fields, fn) {
        if(user.changed('password')) {
          return user.updatePassword(fn);
        }
        fn();
      }
    },

    /**
     * Instance Methods
     */
    instanceMethods: {
      /**
       * Authenticate - check if the passwords are the same
       *
       * @param {String} password
       * @param {Function} callback
       * @return {Boolean}
       * @api public
       */
      authenticate(password, callback) {
        if(!callback) {
          return this.password === this.encryptPassword(password);
        }

        this.encryptPassword(password, (err, pwdGen) => {
          if(err) {
            return callback(err);
          }

          if(this.password === pwdGen) {
            return callback(null, true);
          } else {
            return callback(null, false);
          }
        });
      },

      /**
       * Make salt
       *
       * @param {Number} [byteSize] - Optional salt byte size, default to 16
       * @param {Function} callback
       * @return {String}
       * @api public
       */
      makeSalt(...args) {
        var defaultByteSize = 16;
        var callback;
        var byteSize;

        if(typeof args[0] === 'function') {
          callback = args[0];
          byteSize = defaultByteSize;
        } else if(typeof args[1] === 'function') {
          callback = args[1];
        } else {
          throw new Error('Missing Callback');
        }

        if(!byteSize) {
          byteSize = defaultByteSize;
        }

        return crypto.randomBytes(byteSize, function(err, salt) {
          if(err) {
            return callback(err);
          }
          return callback(null, salt.toString('base64'));
        });
      },

      /**
       * Encrypt password
       *
       * @param {String} password
       * @param {Function} callback
       * @return {String}
       * @api public
       */
      encryptPassword(password, callback) {
        if(!password || !this.salt) {
          return callback ? callback(null) : null;
        }

        var defaultIterations = 10000;
        var defaultKeyLength = 64;
        var salt = new Buffer(this.salt, 'base64');
        var digest = 'sha512';

        if(!callback) {
          // eslint-disable-next-line no-sync
          return crypto.pbkdf2Sync(password, salt, defaultIterations, defaultKeyLength, digest)
            .toString('base64');
        }

        return crypto.pbkdf2(password, salt, defaultIterations, defaultKeyLength, digest,
          function(err, key) {
            if(err) {
              return callback(err);
            }
            return callback(null, key.toString('base64'));
          });
      },

      /**
       * Update password field
       *
       * @param {Function} fn
       * @return {String}
       * @api public
       */
      updatePassword(fn) {
        // Handle new/update passwords
        if(!this.password) return fn(null);

        if(!validatePresenceOf(this.password) && authTypes.indexOf(this.provider) === -1) {
          fn(new Error('Invalid password'));
        }

        // Make salt with a callback
        this.makeSalt((saltErr, salt) => {
          if(saltErr) {
            return fn(saltErr);
          }
          this.salt = salt;
          this.encryptPassword(this.password, (encryptErr, hashedPassword) => {
            if(encryptErr) {
              fn(encryptErr);
            }
            this.password = hashedPassword;
            fn(null);
          });
        });
      }
    }
  });

  return User;
}
