'use strict';

const fs = require('fs');
const path = require('path');

// do on load
const files = fs.readdirSync(path.join(__dirname, '../../../client/assets/twitter-media'));
let media = [];
files.forEach(file => media.push(file))

function getRandomMedia() {
  return media[Math.floor(Math.random()*media.length)];
}

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
    media_path: {
      type: DataTypes.STRING,
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
      beforeBulkCreate(tweets, fields) {
        var totalUpdated = 0;
        tweets.forEach(tweets => {
          tweets.media_path = getRandomMedia();
        });
      },
      beforeCreate(tweet, fields) {
        tweet.media_path = getRandomMedia();
      },
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
