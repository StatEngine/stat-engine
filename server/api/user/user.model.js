'use strict';

import crypto from 'crypto';

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
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'The specified username is already in use.'
      },
      validate: {
        isAlphanumeric: true,
        len: [2, 20],
      }
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
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    nfors: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'user'
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    api_key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password_reset_expire: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    aws_access_key_id: {
      type: DataTypes.STRING,
    },
    aws_secret_access_key: {
      type: DataTypes.STRING,
    },
    requested_fire_department_id: {
      type: DataTypes.INTEGER,
    },
    provider: DataTypes.STRING,
    salt: DataTypes.STRING,
    unsubscribed_emails: {
      type: DataTypes.STRING,
    },
  }, {
    validate: {
      async validateEmail() {
        // Sequelize's unique constraint is case-sensitive, so we need to do a manual
        // case-insensitive check for an existing email here.
        const user = await User.find({
          where: sequelize.where(
            sequelize.fn('LOWER', sequelize.col('email')),
            this.email.toLowerCase(),
          ),
        });

        if(user) {
          throw new Error(`The specified email address is already in use.`);
        }
      },
    },

    /**
     * Virtual Getters
     */
    getterMethods: {
      // Public profile information
      roles() {
        return this.role ? this.role.split(',') : [];
      },
      name() {
        return `${this.first_name} ${this.last_name}`;
      },
      isIngest() {
        return this.roles.indexOf('ingest') >= 0;
      },
      isAdmin() {
        return this.roles.indexOf('admin') >= 0;
      },
      isGlobal() {
        return this.roles.indexOf('global') >= 0
               || this.roles.indexOf('admin') >= 0;
      },
      isDepartmentAdmin() {
        return this.roles.indexOf('department_admin') >= 0
               || this.roles.indexOf('admin') >= 0;
      },
      isDashboardUser() {
        return this.roles.indexOf('admin') >= 0
              || this.roles.indexOf('department_admin') >= 0
              || this.roles.indexOf('dashboard_user') >= 0;
      },
    },

    /**
     * Pre-save hooks
     */
    hooks: {
      beforeBulkCreate(users, fields, fn) {
        var totalUpdated = 0;
        users.forEach(user => {
          user.username = user.username.toLowerCase();
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
        user.username = user.username.toLowerCase();
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
        var salt = Buffer.from(this.salt, 'base64');
        var digest = 'sha512';

        if(!callback) {
          // eslint-disable-next-line no-sync
          return crypto.pbkdf2Sync(password, salt, defaultIterations, defaultKeyLength, digest)
            .toString('base64');
        }

        return crypto.pbkdf2(password, salt, defaultIterations, defaultKeyLength, digest, function(err, key) {
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

        if(!validatePresenceOf(this.password)) {
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
      },

      isSubscribedToEmail(emailName) {
        if(!this.unsubscribed_emails) {
          return true;
        }

        return !this.unsubscribed_emails.split(',').includes(emailName);
      }
    },
    underscored: true,
  });

  return User;
}
