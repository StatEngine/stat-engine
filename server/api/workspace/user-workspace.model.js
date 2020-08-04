'use strict';

export const WORKSPACE_PERMISSIONS = ['ro_strict', 'ro', 'rw', 'admin'];

export default function(sequelize, DataTypes) {
  var UserWorkspace = sequelize.define('UserWorkspace', {
    // corresponds to readonlyrest permissions
    permission: {
      type: DataTypes.ENUM(WORKSPACE_PERMISSIONS),
      defaultValue: WORKSPACE_PERMISSIONS[0],
    },
    is_owner: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    },

    underscored: true,
  });

  return UserWorkspace;
}
