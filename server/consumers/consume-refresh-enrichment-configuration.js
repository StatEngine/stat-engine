import { Tweet } from '../sqldb';

import { Extension } from '../sqldb';
import { ExtensionConfiguration } from '../sqldb';

import { publishEnrichmentConfiguration } from '../publishers';

module.exports.consumeRefreshEnrichmentConfiguration = (msg, done) =>{
  ExtensionConfiguration.findAll({
    include: [{
      model: Extension,
    }]
  }).then(extensionConfigurations => {
    extensionConfigurations.forEach(extensionConfiguration => publishEnrichmentConfiguration(extensionConfiguration.get()));
    done()
  }).catch((err) => done(err));
}
