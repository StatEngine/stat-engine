'use strict';

export default function(sequelize, DataTypes) {
  const ExtensionConfiguration = sequelize.define('ExtensionConfiguration', {
    _id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    extension_name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      },
    },
    extension_type: {
      type: DataTypes.ENUM('ENRICHMENT', 'INTEGRATION', 'PERIODIC'),
      validate: {
        notEmpty: true
      },
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
