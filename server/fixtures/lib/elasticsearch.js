import connection from '../../elasticsearch/connection';

export function createIndex(params, cb) {
  const client = connection.getClient();
  client.indices.exists(params, (err, exists) => {
    if (err) return cb(err);
    else if (exists) return cb();
    return client.indices.create(params, cb);
  });
}

export function deleteIndex(params, cb) {
  const client = connection.getClient();
  client.indices.exists(params, (err, exists) => {
    if (err) return cb(err);
    else if (!exists) return cb();
    return client.indices.delete(params, cb);
  });
}

export function updateDoc(params, cb) {
  const client = connection.getClient();
  client.update(params, cb);
}

export function putIndexTemplate(params, cb) {
  const client = connection.getClient();
  client.indices.putTemplate(params, cb);
}
