import * as dotenv from "dotenv";
dotenv.config();
import multer from "multer";
import AWS from "aws-sdk";
import multerS3 from "multer-s3-transform";

const S3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_BUCKET_REGION,
});

const storage = multerS3({
  s3: S3,
  bucket: process.env.AWS_BUCKET_NAME,
  key: function (req:any, file:any, cb:any) {
    if (file.fieldname == "image") {
      cb(
        null,
        `${process.env.AWS_S3_FOLDER}/` +
          Date.now().toString() +
          file.originalname
      );
    }
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

export default upload;
