'use strict';

export default function(sequelize, DataTypes) {
  const AppInstallation = sequelize.define('AppInstallations', {
    _id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
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

    /**
     * Instance Methods
     */
    instanceMethods: {
    },

    underscored: true,
  });

  return AppInstallation;
}