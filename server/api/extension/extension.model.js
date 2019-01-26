'use strict';

export default function(sequelize, DataTypes) {
  const Extension = sequelize.define('Extensions', {
    _id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    type: {
      type: DataTypes.ENUM('ENRICHMENT', 'INTEGRATION', 'PERIODIC'),
      validate: {
        notEmpty: true
      },
    },
    name: {
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
    date_created: {
      type: DataTypes.DATE,
      validate: {
        notEmpty: true
      },
      defaultValue: new Date()
    },
    date_updated: {
      type: DataTypes.DATE,
    },
    config_options: {
      type: DataTypes.ARRAY(DataTypes.JSON)
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


  return Extension;
}
