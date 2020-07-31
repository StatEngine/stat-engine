const fs = require('fs');
const util = require('util');
const readdirAsync = util.promisify(fs.readdir);
const readFileAsync = util.promisify(fs.readFile);
const env = require('../env.json');
const mandrill = require('mandrill-api/mandrill');
const mandrill_client = new mandrill.Mandrill(env.MANDRILL_API_KEY);

const fetchTemplates = async () => {
  return new Promise((resolve, reject) => {
    mandrill_client.templates.list(null, 
      result => resolve(result), 
      error => reject(error)
    );
  });
};

const getLocalTemplates = async () => {
  return readdirAsync('./email/');
};

const getSlugs = templates => {
  return templates.map(template => {
    const [slug] = template.split('.');
    return slug;
  });
};

const uploadTemplates = templates => {
  const promises = templates.map(async template => {
    const contents = await readFileAsync(`./email/${template.slug}.hbs`, 'utf8');

    const newTemplate = {
      ...template,
      code: contents
    };

    return new Promise((resolve, reject) => {
      mandrill_client.templates.update(
        newTemplate,
        resolve,
        reject
      );
    });
  });

  return Promise.all(promises);
};

(async function () {
  try {
    const localTemplates = await getLocalTemplates();
    const slugs = getSlugs(localTemplates);
    const templates = await fetchTemplates();
    const templatesToUpload = templates.filter(template => slugs.includes(template.slug));
    await uploadTemplates(templatesToUpload);
    console.log('Templates Uploaded');
  } catch (err) {
    console.error(err);
  }
})();