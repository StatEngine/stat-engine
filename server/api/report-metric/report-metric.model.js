'use strict';

export default function(sequelize, DataTypes) {
  const ReportMetric = sequelize.define('ReportMetrics', {

    _id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    views: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true
      },
      default: 0
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


  return ReportMetric;
}
