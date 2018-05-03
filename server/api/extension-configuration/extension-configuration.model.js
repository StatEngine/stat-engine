'use strict';

export default function(sequelize, DataTypes) {
  const ExtensionConfiguration = sequelize.define('ExtensionConfiguration', {
    _id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      validate: {
        notEmpty: true
      },
      defaultValue: false
    },
    config_json: {
      type: DataTypes.JSON,
      validate: {
        notEmpty: true
      }
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


  return ExtensionConfiguration;
}
