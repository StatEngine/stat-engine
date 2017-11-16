'use strict';

export default function(sequelize, DataTypes) {
  const FireDepartment = sequelize.define('FireDepartments', {

    _id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    fd_id: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    },
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    },
    state: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    },
    firecares_id: {
      type: DataTypes.STRING,
    },
    timezone: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    },
  }, {

    /**
     * Virtual Getters
     */
    getterMethods: {
      // Public profile information
      es_indices() {
        return {
          incident: `${this.fd_id}-${this.state}-${this.name}-incident*`.toLowerCase().replace(/ /g, '_'),
          telemetry: `${this.fd_id}-${this.state}-${this.name}-telemetry*`.toLowerCase().replace(/ /g, '_')
        };
      },
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


  return FireDepartment;
}
