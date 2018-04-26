'use strict';

export default function(sequelize, DataTypes) {
  const ExtensionRequest = sequelize.define('ExtensionRequest', {
    _id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    requested: {
      type: DataTypes.BOOLEAN,
      validate: {
        notEmpty: true
      },
      defaultValue: false
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


  return ExtensionRequest;
}
