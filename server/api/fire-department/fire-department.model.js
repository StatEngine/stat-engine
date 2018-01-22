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
          'fire-incident': `${this.firecares_id}-${this.state}-${this.name}-fire-incident*`
            .toLowerCase()
            .replace(/ /g, '_')
            .replace(/&/g, 'and'),
          'vehicle-telemetry': `${this.firecares_id}-${this.state}-${this.name}-vehicle-telemetry*`
            .toLowerCase()
            .replace(/ /g, '_')
            .replace(/&/g, 'and'),
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
