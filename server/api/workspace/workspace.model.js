'use strict';

import _ from 'lodash';
import slugify from 'slugify';

export default function(sequelize, DataTypes) {
  var Workspace = sequelize.define('Workspace', {

    _id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      },
    },
    slug: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      },
    },
    description: {
      type: DataTypes.TEXT,
      validate: {
        notEmpty: true
      },
    },
    color: {
      type: DataTypes.STRING,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {

    getterMethods: {},

    indexes: [{
      unique: true,
      fields: ['slug', 'fire_department__id']
    }, {
      unique: true,
      fields: ['name', 'fire_department__id']
    }],

    hooks: {
      beforeCreate(workspace, fields, cb) {
        /* ES Rules for index names

          Lowercase only
          Cannot include \, /, *, ?, ", <, >, |, ` ` (space character), ,, #
          Indices prior to 7.0 could contain a colon (:), but that’s been deprecated and won’t be supported in 7.0+
          Cannot start with -, _, +
          Cannot be . or ..
          Cannot be longer than 255 bytes (note it is bytes, so multi-byte characters will count towards the 255 limit faster)
        */
        workspace.slug = slugify(workspace.name, {
          replacement: '-', // replace spaces with replacement
          remove: /[*:?"<>|#\/\\,]/g, // regex to remove characters, TODO test this
          lower: true // result in lower case
        });
        cb();
      },
    },

    instanceMethods: {},

    underscored: true,
  });

  return Workspace;
}
