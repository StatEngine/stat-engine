'use strict';

export default function(sequelize, DataTypes) {
  const App = sequelize.define('Apps', {
    _id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(20),
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
    short_description: {
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
    features: {
      type: DataTypes.ARRAY(DataTypes.STRING)
    },
    categories: {
      type: DataTypes.ARRAY(DataTypes.STRING)
    },
    permissions: {
      type: DataTypes.ARRAY(DataTypes.STRING)
    },
    hidden: {
      type: DataTypes.BOOLEAN,
      default: false
    },
    featured: {
      type: DataTypes.BOOLEAN,
      default: false
    },
    image_url: {
      type: DataTypes.STRING,
    },
    preview_url: {
      type: DataTypes.STRING,
    },
    client_secret: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      },
    },
    client_id: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      },
    },
    webhook_url: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      },
    },
    webhook_secret: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      },
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

  return App;
}