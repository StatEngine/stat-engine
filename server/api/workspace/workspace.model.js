'use strict';

import esConnection from '../../elasticsearch/connection';
import parseJsonTemplate from 'json-templates';
import kibanaApi from '../../kibana/kibana-api';

export default function(sequelize, DataTypes) {
  const FixtureTemplate = sequelize.import('../fixture-template/fixture-template.model');
  const FireDepartment = sequelize.import('../fire-department/fire-department.model');

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

    instanceMethods: {
      async getDashboards() {
        const response = await kibanaApi.get({
          uri: '/api/saved_objects/_find',
          qs: {
            type: 'dashboard',
            fields: 'id',
            per_page: 10000,
          },
        });

        const fixtureTemplateIds = response.saved_objects.map(so => so.id);

        const fixtureTemplates = await FixtureTemplate.findAll({
          where: { _id: fixtureTemplateIds },
        });

        return fixtureTemplates;
      },

      async addFixturesWithIds(ids) {
        const fixtureTemplates = await FixtureTemplate.findAll({
          where: { _id: ids },
        });

        await this.addFixtures(fixtureTemplates);
      },

      async addFixtures(fixtureTemplates) {
        // Get the Kibana template data from the fixture template.
        const kibanaTemplates = [];
        for (const fixtureTemplate of fixtureTemplates) {
          kibanaTemplates.push(fixtureTemplate.kibana_template);
        }

        // Apply variables to the Kibana templates.
        if (!this.FireDepartment) {
          this.FireDepartment = await FireDepartment.find({
            where: { _id: this.fire_department__id },
          });
        }

        const kibanaTemplateVariables = {
          fire_department: this.FireDepartment.get(),
          kibana: {
            tenancy: this.index,
          },
        };

        const savedObjects = [];
        for (const kibanaTemplate of kibanaTemplates) {
          const parsedTemplate = parseJsonTemplate(JSON.stringify(kibanaTemplate));
          let appliedTemplates = JSON.parse(parsedTemplate(kibanaTemplateVariables));

          if (!Array.isArray(appliedTemplates)) {
            appliedTemplates = [appliedTemplates];
          }

          appliedTemplates.forEach(template => {
            const type = template._source.type;
            savedObjects.push({
              type,
              id: template._id.split(':')[1],
              attributes: template._source[type],
            });
          });
        }

        // Update Kibana.
        if (savedObjects.length > 0) {
          await kibanaApi.post({
            uri: '/api/saved_objects/_bulk_create',
            body: savedObjects,
          });
        }
      },

      async removeFixturesWithIds(ids) {
        // Get fixture templates so we have access to the types.
        const fixtureTemplates = await FixtureTemplate.findAll({
          where: { _id: ids },
        });

        // Update Kibana.
        for (const fixtureTemplate of fixtureTemplates) {
          const type = fixtureTemplate.type;
          const id = fixtureTemplate._id;

          console.log(`Removing fixture: ${id}`);

          await kibanaApi.delete({
            uri: `/api/saved_objects/${type}/${id}`,
          });
        }
      },
    },

    underscored: true,
  });

  return Workspace;
}
