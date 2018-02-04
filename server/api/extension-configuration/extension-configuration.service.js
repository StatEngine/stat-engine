import compose from 'composable-middleware';

import { ExtensionConfiguration } from '../../sqldb';

export function hasExtensionConfiguration(extension_name) {
  if(!extension_name) {
    throw new Error('extension_name needs to be set');
  }

  return compose()
    .use((req, res, next) => {
      console.dir(req.user.fire_department__id);
      console.dir(extension_name)
      return ExtensionConfiguration.find({
        where: {
          fire_department__id: req.user.fire_department__id,
          extension_name: extension_name,
          enabled: true,
        },
      }).nodeify((err, extensionConfiguration) => {
        if(err) {
          return res.status(500);
        } else if(!extensionConfiguration) {
          return res.status(500).send('No Extension Configuration Found');
        }
        req.extensionConfiguration = extensionConfiguration;

        next();
      });
    });
}
