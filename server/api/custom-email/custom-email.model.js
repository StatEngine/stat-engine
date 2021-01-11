import { Sequelize } from 'sequelize';
import uuid from 'uuid';

export default function(sequelize, DataTypes) {
  const CustomEmail = sequelize.define('CustomEmail', {

    _id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    fd_id: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    schedule: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    by_shift: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    sections: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: { notEmpty: true },
    },
    last_sent: { type: DataTypes.DATE },
  }, {
    /**
     * Pre-save hooks
     */
    hooks: {},

    /**
     * Instance Methods
     */
    instanceMethods: {},
    underscored: true,
    timestamps: true,
  });

  return CustomEmail;
}
