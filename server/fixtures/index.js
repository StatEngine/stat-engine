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
      await FixtureTemplate.create({
        _id: data._id,
        type,
        kibana_template: data,
      });
    }
  }
}
