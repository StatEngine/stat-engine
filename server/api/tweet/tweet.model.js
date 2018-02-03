'use strict';

export default function(sequelize, DataTypes) {
  const Tweet = sequelize.define('Tweets', {

    _id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'TWEETED', 'FAILED'),
      validate: {
        notEmpty: true
      },
      defaultValue: 'PENDING'
    },
    date_created: {
      type: DataTypes.DATE,
      validate: {
        notEmpty: true
      },
      defaultValue: new Date()
    },
    date_tweeted: {
      type: DataTypes.DATE,
    },
    tweeted_by: {
      type: DataTypes.STRING,
    },
    date_updated: {
      type: DataTypes.DATE,
    },
    updated_by: {
      type: DataTypes.STRING,
    },
    tweet_json: {
      type: DataTypes.JSON,
      validate: {
        notEmpty: true
      }
    },
    response_json: {
      type: DataTypes.JSON
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


  return Tweet;
}
