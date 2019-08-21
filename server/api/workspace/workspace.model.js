'use strict';

export default function(sequelize, DataTypes) {
  const Workspace = sequelize.define('Workspace', {
    _id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
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
    description: {
      type: DataTypes.TEXT,
      validate: {
        notEmpty: true
      },
    },
    color: {
      type: DataTypes.STRING,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    index: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
  }, {

    getterMethods: {},

    indexes: [{
      unique: true,
      fields: ['slug', 'fire_department__id']
    }, {
      unique: true,
      fields: ['name', 'fire_department__id']
    }],

    hooks: {},

    underscored: true,
  });

  return Workspace;
}
