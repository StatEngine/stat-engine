import _ from 'lodash';

import {
  Extension,
  ExtensionConfiguration,
  FireDepartment
} from '../../sqldb';

import { publishEnrichmentConfiguration } from '../../publishers';

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    console.error(err);
    return res.status(statusCode).send(err);
  };
}

export function search(req, res) {
  return ExtensionConfiguration.find({
    where: {
      fire_department__id: req.user.fire_department__id,
    },
    include: [{
      model: Extension,
      where: { name: req.query.name }
    }]
  })
    .then(extensionConfiguration => {
      if(req.query.limit === 1 && extensionConfiguration.length > 0) {
        extensionConfiguration = extensionConfiguration[0];
      }
      return res.json(extensionConfiguration);
    })
    .catch(handleError(res));
}

export function update(req, res) {
  if(req.query.action === 'enable') {
    return enable(req, res);
  } else if(req.query.action === 'disable') {
    return disable(req, res);
  } else {
    return updateOptions(req, res);
  }
}

export function updateOptions(req, res) {
  return ExtensionConfiguration.find({
    where: {
      _id: req.params.id,
      fire_department__id: req.fire_department._id,
    },
    include: [{
      model: Extension,
    }, {
      model: FireDepartment,
    }]
  }).then(config => {
    if(!config) return res.status(500).end({ msg: 'Could not find extension configuration'});

    config.config_json = _.merge(config.config_json, req.body);
    config.changed('config_json', true);

    return config.save()
      .then(updated => {
        publishEnrichmentConfiguration(updated.get());
        return res.status(204).send();
      })
      .catch(handleError(res));
  });
}


export function enable(req, res) {
  return ExtensionConfiguration.find({
    where: {
      _id: req.params.id,
      fire_department__id: req.fire_department._id,
    },
    include: [{
      model: Extension,
    }, {
      model: FireDepartment,
    }]
  }).then(config => {
    if(!config) return res.status(500).end({ msg: 'Could not find extension configuration'});

    config.enabled = true;

    return config.save()
      .then(updated => {
        publishEnrichmentConfiguration(updated.get());
        return res.status(204).send();
      })
      .catch(handleError(res));
  });
}

export function disable(req, res) {
  return ExtensionConfiguration.find({
    where: {
      _id: req.params.id,
      fire_department__id: req.fire_department._id,
    },
    include: [{
      model: Extension,
    }, {
      model: FireDepartment,
    }]
  }).then(config => {
    if(!config) return res.status(500).end({ msg: 'Could not find extension configuration'});

    config.enabled = false;

    return config.save()
      .then(updated => {
        publishEnrichmentConfiguration(updated.get());
        return res.status(204).send();
      })
      .catch(handleError(res));
  });
}

export function get(req, res) {
  var id = req.params.id;

  return ExtensionConfiguration.find({
    where: {
      _id: id,
      fire_department__id: req.fire_department._id,
    }
  })
    .then(extensionConfiguration => {
      if(!extensionConfiguration) {
        return res.status(404).end();
      }
      res.json(extensionConfiguration);
    })
    .catch(handleError(res));
}

export function create(req, res) {
  return Extension.find({
    where: {
      name: req.query.name
    }
  })
    .then(extension => {
      if(!extension) return res.status(500).end({ msg: 'Could not find extension'});

      return ExtensionConfiguration.create({
        extension__id: extension._id,
        fire_department__id: req.fire_department._id,
        config_json: {},
        enabled: true,
      })
        .then(extensionConfiguration => {
          res.json(extensionConfiguration);
        })
        .catch(handleError(res));
    });
}
