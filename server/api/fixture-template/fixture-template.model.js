'use strict';

import randomstring from 'randomstring';

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
        isIn: [[
          'visualization',
          'dashboard',
          'search',
          'index-pattern',
          'config',
          'timelion-sheet',
        ]],
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
    kibana_template: {
      type: DataTypes.JSONB,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  }, {
    validate: {
      validateDashboardAttributes() {
        if (this.type === 'dashboard') {
          if (this.title == null || !this.title.length) {
            throw new Error('FixtureTemplate with type "dashboard" requires "title" attribute.');
          }

          if (this.description == null || !this.description.length) {
            throw new Error('FixtureTemplate with type "dashboard" requires "description" attribute.');
          }

          if (this.author == null || !this.author.length) {
            throw new Error('FixtureTemplate with type "dashboard" requires "author" attribute.');
          }
        }
      },
    },

    getterMethods: {},
    indexes: [],
    hooks: {},
    instanceMethods: {},
    underscored: true,
  });

  FixtureTemplate.templateIdToUniqueId = function(templateId) {
    return `${templateId}--${randomstring.generate(8)}`;
  };

  FixtureTemplate.uniqueIdToTemplateId = function(uniqueId) {
    const idParts = uniqueId.split('--');
    if (idParts.length < 2) {
      throw new Error(`Fixture template unique id must be in the format "{templateId}--{hash}" (invalid id = "${uniqueId}")`);
    }

    return idParts.slice(0, -1).join('--');
  };

  return FixtureTemplate;
}
