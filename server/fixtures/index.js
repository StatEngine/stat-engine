import * as async from 'async';

import {
  createIndex,
  deleteIndex,
  putIndexTemplate,
} from './lib/elasticsearch';
import {
  loadTemplates,
} from './lib/load-templates';
import { Log } from '../util/log';

const loadTemplateType = (index, type, options, locals, cb) => loadTemplates({
  index,
  type,
  options,
  locals,
}, cb);

// Creates a Kibana Index
export function createKibanaIndex(options, locals, cb) {
  const index = locals.kibana.tenancy;
  Log.info(`Creating Kibana index: ${index}`);
  return createIndex({
    index,
  }, cb);
}

// export function createKibanaIndexTemplate(options, locals, cb) {
//   const index = locals.kibana.tenancy;
//   Log.info(`Creating Kibana index: ${index}`);
//   return createIndexTemplate({
//     index,
//   }, cb);
// }

// Deletes a Kibana Index
export function deleteKibanaIndex(options, locals, cb) {
  const index = locals.kibana.tenancy;
  Log.info(`Deleting Kibana index: ${index}`);
  return deleteIndex({
    index,
  }, cb);
}

// Seeds configurations settings in Kibana
export function seedKibanaConfig(options, locals, cb) {
  const index = locals.kibana.tenancy;
  Log.info(`Seeding Kibana config: ${index}`);
  return loadTemplateType(index, 'config', options, locals, cb);
}

// Seeds index patterns in Kibana
export function seedKibanaIndexPatterns(options, locals, cb) {
  const index = locals.kibana.tenancy;
  Log.info(`Seeding Kibana index patterns: ${index}`);
  return loadTemplateType(index, 'index-pattern', options, locals, cb);
}

// Seeds visualizations in Kibana
export function seedKibanaVisualizations(options, locals, cb) {
  const index = locals.kibana.tenancy;
  Log.info(`Seeding Kibana visualizations: ${index}`);
  return loadTemplateType(index, 'visualization', options, locals, cb);
}

// Seeds dashboards in Kibana
export function seedKibanaDashboards(options, locals, cb) {
  const index = locals.kibana.tenancy;
  Log.info(`Seeding Kibana dashboards: ${index}`);
  return loadTemplateType(index, 'dashboard', options, locals, cb);
}
// Seeds kibana template
export function seedKibanaTemplate(options, locals, cb) {
  const index = locals.kibana.tenancy;
  putIndexTemplate({
    name: `kibana_index_template:${index}`,
    order: 0,
    body: {
      index_patterns: [ index ],
      index: {
        number_of_shards: '1',
        auto_expand_replicas: '0-1',
      },
      mappings: {
        doc: {
          dynamic: 'strict',
          properties: {
            type: {
              type: 'keyword',
            },
            updated_at: {
              type: 'date',
            },
            config: {
              dynamic: true,
              properties: {
                buildNum: {
                  type: 'keyword',
                },
              },
            },
            'timelion-sheet': {
              properties: {
                description: {
                  type: 'text',
                },
                hits: {
                  type: 'integer',
                },
                kibanaSavedObjectMeta: {
                  properties: {
                    searchSourceJSON: {
                      type: 'text',
                    },
                  },
                },
                timelion_chart_height: {
                  type: 'integer',
                },
                timelion_columns: {
                  type: 'integer',
                },
                timelion_interval: {
                  type: 'keyword',
                },
                timelion_other_interval: {
                  type: 'keyword',
                },
                timelion_rows: {
                  type: 'integer',
                },
                timelion_sheet: {
                  type: 'text',
                },
                title: {
                  type: 'text',
                },
                version: {
                  type: 'integer',
                },
              },
            },
            'index-pattern': {
              properties: {
                fieldFormatMap: {
                  type: 'text',
                },
                fields: {
                  type: 'text',
                },
                intervalName: {
                  type: 'keyword',
                },
                notExpandable: {
                  type: 'boolean',
                },
                sourceFilters: {
                  type: 'text',
                },
                timeFieldName: {
                  type: 'keyword',
                },
                title: {
                  type: 'text',
                },
              },
            },
            visualization: {
              properties: {
                description: {
                  type: 'text',
                },
                kibanaSavedObjectMeta: {
                  properties: {
                    searchSourceJSON: {
                      type: 'text',
                    },
                  },
                },
                savedSearchId: {
                  type: 'keyword',
                },
                title: {
                  type: 'text',
                },
                uiStateJSON: {
                  type: 'text',
                },
                version: {
                  type: 'integer',
                },
                visState: {
                  type: 'text',
                },
              },
            },
            search: {
              properties: {
                columns: {
                  type: 'keyword',
                },
                description: {
                  type: 'text',
                },
                hits: {
                  type: 'integer',
                },
                kibanaSavedObjectMeta: {
                  properties: {
                    searchSourceJSON: {
                      type: 'text',
                    },
                  },
                },
                sort: {
                  type: 'keyword',
                },
                title: {
                  type: 'text',
                },
                version: {
                  type: 'integer',
                },
              },
            },
            dashboard: {
              properties: {
                description: {
                  type: 'text',
                },
                hits: {
                  type: 'integer',
                },
                kibanaSavedObjectMeta: {
                  properties: {
                    searchSourceJSON: {
                      type: 'text',
                    },
                  },
                },
                optionsJSON: {
                  type: 'text',
                },
                panelsJSON: {
                  type: 'text',
                },
                refreshInterval: {
                  properties: {
                    display: {
                      type: 'keyword',
                    },
                    pause: {
                      type: 'boolean',
                    },
                    section: {
                      type: 'integer',
                    },
                    value: {
                      type: 'integer',
                    },
                  },
                },
                timeFrom: {
                  type: 'keyword',
                },
                timeRestore: {
                  type: 'boolean',
                },
                timeTo: {
                  type: 'keyword',
                },
                title: {
                  type: 'text',
                },
                uiStateJSON: {
                  type: 'text',
                },
                version: {
                  type: 'integer',
                },
              },
            },
            url: {
              properties: {
                accessCount: {
                  type: 'long',
                },
                accessDate: {
                  type: 'date',
                },
                createDate: {
                  type: 'date',
                },
                url: {
                  type: 'text',
                  fields: {
                    keyword: {
                      type: 'keyword',
                      ignore_above: 2048,
                    },
                  },
                },
              },
            },
            server: {
              properties: {
                uuid: {
                  type: 'keyword',
                },
              },
            },
          },
        },
      },
    },
  }, cb);
}

// Seeds an entire Kibana Index (DELETES existing data!)
export function seedKibanaAll(options, locals, cb) {
  async.series([
    done => seedKibanaTemplate(options, locals, done),
    done => deleteKibanaIndex(options, locals, done),
    done => createKibanaIndex(options, locals, done),
    done => seedKibanaIndexPatterns(options, locals, done),
    done => seedKibanaConfig(options, locals, done),
    done => seedKibanaVisualizations(options, locals, done),
    done => seedKibanaDashboards(options, locals, done),
  ], cb);
}
