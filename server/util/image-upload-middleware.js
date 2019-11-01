'use strict';

import AWS from 'aws-sdk';
import config from '../config/environment';
import multer from 'multer';
import multerS3 from 'multer-s3';
import * as auth from '../auth/auth.service';
import combineMiddleware from './combine-middleware';
import _ from 'lodash';

// Configure S3
const S3Config = _.merge(config.aws, {
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
  endpoint: _.get(config, 's3.endpoint')
});

const s3 = new AWS.S3(S3Config);

const upload = multer({
  storage: multerS3({
    s3,
    bucket: _.get(config, 's3.logosConfig.bucket') || 'uploads',
    acl: 'public-read',
    cacheControl: 'max-age=31536000',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, `${_.get(config, 's3.logosConfig.prefix')}${file.originalname}`);
    }
  }),
});

const uploadController = (req, res) => {
  if (!req.file) {
    return res.status(500).send({ error: 'Error while uploading department logo'});
  }
  return res.status(200).send({ uri: req.file.location });
};

export default combineMiddleware([
  upload.single('file'),
  uploadController,
]);
