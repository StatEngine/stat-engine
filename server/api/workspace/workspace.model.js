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
  }, {

    /**
     * Virtual Getters
     */
    getterMethods: {
    },

    /**
     * Pre-save hooks
     */
    hooks: {
      beforeCreate(workspace, fields, cb) {
        workspace.slug = slugify(workspace.name, {
          replacement: '-',    // replace spaces with replacement
          remove: null,        // regex to remove characters, TODO - check kibanan naming
          lower: true          // result in lower case
        })
        cb();
      },
    },

    /**
     * Instance Methods
     */
    instanceMethods: {
    },

    underscored: true,
  });

  /*Workspace.addHook('afterCreate', (workspace, options) => {
    // These operations will be part of the same transaction as the
    // original Workspace.create call.
    // create new rows in workspace permssions, for each workspace permission type
    return Promise.all(_.map(WORKSPACE_PERMISSIONS, p => Workspace.sequelize.models.WorkspacePermissions.create({
      permission: p,
      workspace__id: workspace._id
    }, {
      transaction: options.transaction
    })));
  });*/

  return Workspace;
}
