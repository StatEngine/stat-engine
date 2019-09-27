'use strict';

import parseJsonTemplate from 'json-templates';
import kibanaApi from '../../kibana/kibana-api';
import slugify from 'slugify';

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
  }, {

    getterMethods: {},

    indexes: [{
      unique: true,
      fields: ['slug', 'fire_department__id']
    }, {
      unique: true,
      fields: ['name', 'fire_department__id']
    }],

    hooks: {
      beforeCreate(workspace, fields, cb) {
        /* ES Rules for index names

          Lowercase only
          Cannot include \, /, *, ?, ", <, >, |, ` ` (space character), ,, #
          Indices prior to 7.0 could contain a colon (:), but that’s been deprecated and won’t be supported in 7.0+
          Cannot start with -, _, +
          Cannot be . or ..
          Cannot be longer than 255 bytes (note it is bytes, so multi-byte characters will count towards the 255 limit faster)
        */
        workspace.slug = slugify(workspace.name, {
          replacement: '-', // replace spaces with replacement
          remove: /[*:?"<>|#\/\\,]/g, // regex to remove characters, TODO test this
          lower: true // result in lower case
        });
        cb();
      },
    },

    instanceMethods: {
      getKibanaIndex(fireDepartment) {
        return `.kibana_${fireDepartment.firecares_id}_${this.slug}`;
      },

      async getDashboards() {
        const response = await kibanaApi.get({
          uri: `/api/saved_objects/_find?type=dashboard&fields=id&fields=title&per_page=10000`,
        });

        const fixtureTemplates = await FixtureTemplate.findAll({
          where: { _id: response.saved_objects.map(so => so.id) },
        });

        const fixtureTemplatesById = {};
        fixtureTemplates.forEach(ft => fixtureTemplatesById[ft._id] = ft);

        const dashboards = [];
        for (const savedObject of response.saved_objects) {
          const fixtureTemplate = fixtureTemplatesById[savedObject.id];
          if (fixtureTemplate) {
            const dashboard = fixtureTemplate;
            dashboards.push(dashboard);
          } else {
            dashboards.push({
              _id: savedObject.id,
              title: savedObject.attributes.title,
            });
          }
        }

        return dashboards;
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
          console.log('Adding Kibana fixtures:');
          savedObjects.forEach(so => console.log(`(${so.type}) ${so.id}`));

          await kibanaApi.post('/api/saved_objects/_bulk_create', {
            body: savedObjects,
          });
        }
      },

      async removeFixtures({ type, ids }) {
        // Update Kibana.
        console.log('Removing Kibana Fixtures:');

        for (const id of ids) {
          console.log(`(${type}) ${id}`);

          await kibanaApi.delete(`/api/saved_objects/${type}/${id}`);
        }
      },
    },

    underscored: true,
  });

  return Workspace;
}
