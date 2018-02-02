'use strict';

export default function(sequelize, DataTypes) {
  const Tweet = sequelize.define('Tweets', {

    _id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    tweet_json: {
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


  return Tweet;
}
