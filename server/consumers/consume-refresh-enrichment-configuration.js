import {
  Extension,
  ExtensionConfiguration,
  FireDepartment,
} from '../sqldb';

import { publishEnrichmentConfiguration } from '../publishers';

export function consumeRefreshEnrichmentConfiguration(msg, done) {
  ExtensionConfiguration.findAll({
    include: [{
      model: Extension,
    }, {
      model: FireDepartment,
    }]
  })
    .then(extensionConfigurations => {
      extensionConfigurations.forEach(extensionConfiguration => publishEnrichmentConfiguration(extensionConfiguration.get()));
      done();
    })
    .catch(err => done(err));
}

export default consumeRefreshEnrichmentConfiguration;
