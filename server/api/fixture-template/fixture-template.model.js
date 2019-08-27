'use strict';

export default function(sequelize, DataTypes) {
  const FixtureTemplate = sequelize.define('FixtureTemplate', {
    _id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    title: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
    author: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
    image_url: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
    kibana_template: {
      type: DataTypes.JSONB,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  }, {
    getterMethods: {},
    indexes: [],
    hooks: {},
    instanceMethods: {},
    underscored: true,
  });

  return FixtureTemplate;
}
