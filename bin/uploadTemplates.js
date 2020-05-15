const fs = require('fs');
const path = require('path');
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
  return new Promise((resolve, reject) => {
    fs.readdir('./email/', (error, files) => {
      if (error) {
        return reject(error);
      }
      return resolve(files);
    });
  });
};

const getSlugs = templates => {
  return templates.map(template => {
    const [slug, extension] = template.split('.');
    return slug;
  });
};

const uploadTemplates = templates => {
  const promises = templates.map(template => new Promise((resolve, reject) => {
    fs.readFile(`./email/${template.slug}.hbs`, 'utf8', function(err, contents) {
      if (err) {
        reject(err);
      }

      const newTemplate = {
        ...template,
        code: contents
      };

      mandrill_client.templates.update(
        newTemplate,
        result => resolve(result),
        error => reject(error)
      );
    });
  }));

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
    console.log(err);
  }
})();