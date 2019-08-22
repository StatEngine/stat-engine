'use strict';

import esConnection from '../../elasticsearch/connection';
import bodybuilder from 'bodybuilder';
import parseJsonTemplate from 'json-templates';

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
        // TODO: Replace with Kibana API call.
        const esResponse = await esConnection.getClient().search({
          index: this.index,
          body: bodybuilder()
            .query('match', 'type', 'dashboard')
            .build(),
        });

        // Transform and simplify the ES data.
        const dashboards = [];
        for (const dashboard of esResponse.hits.hits) {
          dashboards.push({
            _id: dashboard._id,
            title: dashboard._source.dashboard.title,
          });
        }

        return dashboards;
      },

      async addFixturesByIds(ids) {
        const fixtureTemplates = await FixtureTemplate.findAll({
          where: { _id: ids },
        });

        await this.addFixtures(fixtureTemplates);
      },

      async addFixturesByType(type) {
        const fixtureTemplates = await FixtureTemplate.findAll({
          where: { type },
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

        const appliedKibanaTemplates = [];
        for (const kibanaTemplate of kibanaTemplates) {
          const parsedTemplate = parseJsonTemplate(JSON.stringify(kibanaTemplate));
          const appliedTemplate = JSON.parse(parsedTemplate(kibanaTemplateVariables));

          if (Array.isArray(appliedTemplate)) {
            appliedTemplate.forEach(obj => appliedKibanaTemplates.push(obj));
          } else {
            appliedKibanaTemplates.push(appliedTemplate);
          }
        }

        // Update docs in ES.
        for (const doc of appliedKibanaTemplates) {
          // TODO: Replace with Kibana API call.
          await esConnection.getClient().update({
            index: this.index,
            type: doc._type,
            id: doc._id,
            body: {
              doc: doc._source,
              doc_as_upsert: true,
            },
          });
        }
      },

      async removeFixturesByIds(ids) {
        // Get fixture templates so we have access to "kibana_template._type".
        const fixtureTemplates = await FixtureTemplate.findAll({
          where: { _id: ids },
        });

        for (const fixtureTemplate of fixtureTemplates) {
          console.log(`Removing fixture: ${fixtureTemplate._id}`);
          await esConnection.getClient().delete({
            index: this.index,
            type: fixtureTemplate.kibana_template._type,
            id: fixtureTemplate._id,
          });
        }
      },
    },

    underscored: true,
  });

  return Workspace;
}
