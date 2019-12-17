import * as async from 'async';
import fs from 'fs';
import path from 'path';
import parse from 'json-templates';

import { updateDoc } from './elasticsearch';
import { Log } from '../../util/log';

export function loadTemplates(params, cb) {
  const templatePath = path.join(__dirname, `../templates/${params.type}`);
  async.waterfall([
    // Read dir
    done => fs.readdir(templatePath, done),
    // Read each file in dir
    (files, done) => {
      const templates = [];
      async.each(files, (file, callback) => {
        fs.readFile(path.join(templatePath, file), 'utf8', (err, str) => {
          if (err) return callback(err);
          templates.push(str);
          return callback();
        });
      }, (err) => {
        done(err, templates);
      });
    },
    // Apply locals to template
    (templates, done) => {
      const docs = [];
      async.each(templates, (template, callback) => {
        setTimeout(() => {
          const parsedTemplate = parse(template);
          const appliedTemplate = JSON.parse(parsedTemplate(params.locals));

          // array or object
          if (appliedTemplate.length > 0) appliedTemplate.forEach(obj => docs.push(obj));
          else docs.push(appliedTemplate);

          return callback();
        }, 0);
      }, (err) => {
        done(err, docs);
      });
    },
    // Update docs into ES
    (docs, done) => {
      async.each(docs, (doc, callback) => {
        Log.info(`Loading: ${doc._id}`);
        updateDoc({
          index: params.index,
          type: doc._type,
          id: doc._id,
          body: {
            doc: doc._source,
            doc_as_upsert: true,
          },
        }, callback);
      }, (err) => {
        done(err);
      });
    }], (err) => {
    cb(err);
  });
}

export default { loadTemplates };
