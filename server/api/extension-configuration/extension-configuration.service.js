import compose from 'composable-middleware';

import { Extension } from '../../sqldb';
import { ExtensionConfiguration } from '../../sqldb';

export function hasExtensionConfiguration(extension_name) {
  if(!extension_name) {
    throw new Error('extension_name needs to be set');
  }

  return compose()
    .use((req, res, next) => {
      return ExtensionConfiguration.find({
        where: {
          fire_department__id: req.user.fire_department__id,
          enabled: true,
        },
        include: [{
          model: Extension,
          where: { name: extension_name }
        }]
      }).nodeify((err, extensionConfiguration) => {
        if(err) {
          return res.status(500);
        } else if(!extensionConfiguration) {
          return res.status(500).send('No Extension Configuration Found');
        }
        console.dir(extensionConfiguration)

        req.extensionConfiguration = extensionConfiguration;

        next();
      });
    });
}
