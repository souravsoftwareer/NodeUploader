
const aws = require('aws-sdk');
const path = require('path');
const config = require('../../config/config');

const s3 = new aws.S3({
  accessKeyId: config.s3.AccessKeyId, // accessKeyId that is stored in .env file
  secretAccessKey: config.s3.SecretAccessKey,
  region: config.s3.Region   // secretAccessKey is also store in .env file
})

const uploadImageToS3 = async (file) => {
  return new Promise(async (resolve, reject) => {
    const fileExtension = path.extname(file?.originalname)
    let fileName = Date.now().toString() + fileExtension;
    let filePath = "images/";
    switch (file.fieldname) {
      case "uploader":
        filePath = filePath + "uploader/" + fileName;
        break;

      default:
        filePath = "default/" + fileName;
    }
    const params = {
      Bucket: config.s3.Bucket,
      ContentType: file?.mimetype,
      Key: filePath,
      Body: file?.buffer,
    }

    s3.upload(params, async (error, data) => {
      if (error) {
        console.log("s3 upload error")
        resolve({ status: false, message: "Unable to upload in s3" }) // if we get any error while uploading error message will be returned.
      }
      resolve({ status: true, message: "Image uploaded to s3", data: data })
    })

  });
}

const uploadVideoToS3 = async (file) => {
  return new Promise((resolve, reject) => {
    const fileExtension = path.extname(file?.originalname)
    let fileName = Date.now().toString() + fileExtension;
    let filePath = "videos/";
    switch (file.fieldname) {
      case "tutorial":
        filePath = filePath + "video/" + fileName;
        break;
     

      default:
        filePath = filePath + "default/" + fileName;
    }
    const params = {
      Bucket: config.s3.Bucket,
      ContentType: file?.mimetype,
      Key: filePath,
      Body: file?.buffer,
      partSize: 10 * 1024 * 1024,
      queueSize: 1
    }
    console.log("params", params)
    s3.upload(params, async (error, data) => {
      if (error) {
        console.log("s3 upload error")
        resolve({ status: false, message: "Unable to upload in s3" }) // if we get any error while uploading error message will be returned.
      }
      resolve({ status: true, message: "Image uploaded to s3", data: data })
    })

  });
}

module.exports = {
  uploadImageToS3,
  uploadVideoToS3,
}