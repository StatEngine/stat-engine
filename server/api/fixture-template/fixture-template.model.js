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
