'use strict';

import aws from 'aws-sdk';
import config from '../config/environment';
import multer from 'multer';
import multerS3 from 'multer-s3';
import * as auth from '../auth/auth.service';
import combineMiddleware from './combine-middleware';

const { minio } = config;
const S3Config = {
  s3ForcePathStyle: true,
  signatureVersion: 'v4'
};

if (minio) {
  S3Config.endpoint = minio.endpoint;
}

const s3 = new aws.S3(S3Config);
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: minio.bucket || 'uploads',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      cb(null, `${Date.now().toString()}-${file.originalname}`);
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
