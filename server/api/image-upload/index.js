'use strict';

import {Router} from 'express';
import aws from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import * as auth from '../../auth/auth.service';

const router = new Router();

const S3Config = {
  s3ForcePathStyle: true,
  signatureVersion: 'v4'
};

if (process.env.FILE_UPLOAD_ENDPOINT) {
  S3Config.endpoint = process.env.FILE_UPLOAD_ENDPOINT;
}

const s3 = new aws.S3(S3Config);
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.FILE_UPLOAD_BUCKET || 'uploads',
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
  return res.status(200).json({ file: req.file });
};

router.post(
  '/',
  auth.isApiAuthenticated,
  auth.hasRole('department_admin'),
  upload.single('file'),
  uploadController,
);

module.exports = router;
