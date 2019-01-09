'use strict';

export default function(sequelize, DataTypes) {
  const App = sequelize.define('Apps', {
    _id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    slug: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      },
    },
    display_name: {
      type: DataTypes.STRING(20),
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
      type: DataTypes.STRING,
    },
    hidden: {
      type: DataTypes.BOOLEAN,
      default: false
    },
    featured: {
      type: DataTypes.BOOLEAN,
      default: false
    },
    image: {
      type: DataTypes.STRING,
      default: 'extension-generic.svg'
    },
    preview: {
      type: DataTypes.STRING,
      default: 'extension-preview-generic.svg'
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

  return App;
}

// check here: https://developer.github.com/apps/building-github-apps/creating-github-apps-from-a-manifest/
// add webhook secret