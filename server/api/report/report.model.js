'use strict';

export default function(sequelize, DataTypes) {
  const Report = sequelize.define('Reports', {

    _id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: 'departmentDate',
      validate: {
        notEmpty: true
      }
    },
    type: {
      type: DataTypes.ENUM('DAILY', 'WEEKLY', 'QUARTLERY', 'YEARLY', 'ADHOC'),
      unique: 'departmentDate',
      validate: {
        notEmpty: true
      },
      default: 'DAILY',
    },
    fire_department__id: {
      type: DataTypes.INTEGER,
      unique: 'departmentDate',
      validate: {
        notEmpty: true,
      }
    },
    content: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        notEmpty: true,
      }
    },
  }, {
    /**
     * Pre-save hooks
     */
    hooks: {
    },

    underscored: true,
    timestamps: true,
  });


  return Report;
}
