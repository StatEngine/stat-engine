'use strict';

export default function(sequelize, DataTypes) {
  const DailyMessage = sequelize.define('DailyMessages', {

    _id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      unique: 'departmentDate',
      validate: {
        notEmpty: true
      }
    },
    config: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        notEmpty: true,
      }
    },
    fire_department__id: {
      type: DataTypes.INTEGER,
      unique: 'departmentDate',
    }
  }, {
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


  return DailyMessage;
}
