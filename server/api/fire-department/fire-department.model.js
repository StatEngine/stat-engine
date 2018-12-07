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
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      }
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    firecares_id: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    integration_complete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    integration_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    latitude: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    logo_link: {
      type: DataTypes.STRING,
    },
    customer_id: {
      type: DataTypes.STRING,
    }
  }, {

    /**
     * Virtual Getters
     */
    getterMethods: {
      // Public profile information
      es_indices() {
        return {
          all: `${this.firecares_id}-${this.state}-${this.name}*`
            .toLowerCase()
            .replace(/ /g, '_')
            .replace(/&/g, 'and'),
          'fire-incident': `${this.firecares_id}-${this.state}-${this.name}-fire-incident*`
            .toLowerCase()
            .replace(/ /g, '_')
            .replace(/&/g, 'and'),
          'apparatus-fire-incident': `${this.firecares_id}-${this.state}-${this.name}-apparatus-fire-incident*`
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
