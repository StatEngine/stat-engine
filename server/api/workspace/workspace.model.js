'use strict';

import querystring from 'querystring';
import parseJsonTemplate from 'json-templates';
import slugify from 'slugify';
import _ from 'lodash';

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
        notEmpty: true,
        async isUnique() {
          // Make sure name is unique for this fire department.
          // Note: We already have a unique index for this, but having the custom validator
          // allow us to return a custom error message.
          const workspace = await Workspace.find({
            where: {
              $and: [
                { fire_department__id: this.fire_department__id },
                sequelize.where(
                  sequelize.fn('lower', sequelize.col('name')),
                  this.name.toLowerCase(),
                ),
              ],
            },
          });

          if(workspace && workspace._id !== this._id) {
            throw new Error('Name must be unique.');
          }
        },
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
    validate: {},

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
        workspace.slug = workspace.buildSlug();
        cb();
      },
    },

    instanceMethods: {
      buildSlug() {
        /* ES Rules for index names

          Lowercase only
          Cannot include \, /, *, ?, ", <, >, |, ` ` (space character), ,, #
          Indices prior to 7.0 could contain a colon (:), but that’s been deprecated and won’t be supported in 7.0+
          Cannot start with -, _, +
          Cannot be . or ..
          Cannot be longer than 255 bytes (note it is bytes, so multi-byte characters will count towards the 255 limit faster)
        */
        return slugify(this.name, {
          replacement: '-', // replace spaces with replacement
          remove: /[*:?"<>|#\/\\,]/g, // regex to remove characters, TODO test this
          lower: true // result in lower case
        });
      },

      getKibanaIndex(fireDepartment) {
        return `.kibana_${fireDepartment.firecares_id}_${this.slug}`;
      },

      async getDashboards(kibanaApi) {
        const qs = querystring.stringify({
          type: 'dashboard',
          fields: ['id', 'title'],
          per_page: 10000,
        });

        const response = await kibanaApi.get(`/api/saved_objects/_find?${qs}`);

        return response.saved_objects.map(so => ({
          _id: so.id,
          title: so.attributes.title,
        }));
      },

      async addDashboards({ dashboards, kibanaApi }) {
        const fixtureTemplates = await FixtureTemplate.findAll({
          where: {
            _id: Object.keys(dashboards).map(id => FixtureTemplate.uniqueIdToTemplateId(id)),
          },
        });

        // Duplicate dashboard templates may have been passed in, but the database request will have trimmed
        // them out. In order to support adding multiple of the same template, we need to make sure the duplicates
        // get added back in.
        const fixtureTemplatesById = {};
        fixtureTemplates.forEach(ft => fixtureTemplatesById[ft._id] = ft);

        const fixtureTemplatesWithDupes = [];
        Object.keys(dashboards).forEach(dashboardId => {
          const dashboard = dashboards[dashboardId];
          const templateId = FixtureTemplate.uniqueIdToTemplateId(dashboardId);
          const fixtureTemplate = _.cloneDeep(fixtureTemplatesById[templateId]);

          // Apply custom data passed in with the dashboards.
          fixtureTemplate.title = dashboard.title;

          fixtureTemplatesWithDupes.push(fixtureTemplate);
        });

        await this.addFixtures({
          fixtureTemplates: fixtureTemplatesWithDupes,
          generateUniqueId: true,
          kibanaApi,
        });
      },

      async addFixtures({ fixtureTemplates, generateUniqueId = false, kibanaApi }) {
        // Get the Kibana template data from the fixture template and apply any custom data.
        const kibanaTemplates = [];
        for (const fixtureTemplate of fixtureTemplates) {
          const kibanaTemplate = fixtureTemplate.kibana_template;

          // Update any attributes with custom data.
          const type = kibanaTemplate._source.type;
          kibanaTemplate._source[type].title = fixtureTemplate.title;

          kibanaTemplates.push(kibanaTemplate);
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
            const templateId = template._id.split(':')[1];

            const id = (generateUniqueId) ? FixtureTemplate.templateIdToUniqueId(templateId) : templateId;
            const type = template._source.type;
            const attributes = template._source[type];

            savedObjects.push({ id, type, attributes });
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

      async removeFixtures({ type, ids, kibanaApi }) {
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
