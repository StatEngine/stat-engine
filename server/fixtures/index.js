import Promise from 'bluebird';
import fs from "fs";
import path from "path";
import { FixtureTemplate } from '../sqldb';

const fsReaddirAsync = Promise.promisify(fs.readdir);
const fsReadFileAsync = Promise.promisify(fs.readFile);

export async function addFixtureTemplatesToDatabase() {
  // Read "/templates" directory.
  const templatesPath = path.join(__dirname, './templates');
  const types = await fsReaddirAsync(templatesPath);

  for (const type of types) {
    // Read "/templates/{type}" directory.
    const templatePath = path.join(__dirname, `./templates/${type}`);
    const files = await fsReaddirAsync(templatePath);

    // Create a FixtureTemplate for each file in the directory.
    for(const file of files) {
      const dataStr = await fsReadFileAsync(path.join(templatePath, file), 'utf8');
      const data = JSON.parse(dataStr);

      let id;
      if (type === 'index-pattern') {
        // Index patterns have templated Kibana ids, so just use the filename for its DB id.
        id = file.split('.')[0];
      } else {
        // Only keep the part after the ':' since Kibana strips the rest out anyways.
        id = data._id.split(':')[1];
      }

      await FixtureTemplate.create({
        _id: id,
        type,
        title: data._source[type].title || null,
        description: data._source[type].description || null,
        author: 'StatEngine',
        kibana_template: data,
      });
    }
  }
}
