const {
  S3Client,
  CreateBucketCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const { v4: uuid } = require("uuid");
require("dotenv").config(); // Make sure to use dotenv to load env variables

// Create an S3 client
//
// You must copy the endpoint from your B2 bucket details
console.log("process.env.AWS_INDPOINT_URL :>> ", process.env.AWS_INDPOINT_URL);
console.log("process.env.BUCKET_REGION :>> ", process.env.BUCKET_REGION);
// and set the region to match.
const s3 = new S3Client({
  endpoint: process.env.AWS_INDPOINT_URL,
  region: "us-east-005",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
// Create a bucket and upload something into it

const uploadFile = async (bucketName, keyName, data) => {
  try {
    // await s3.send(new CreateBucketCommand({ Bucket: bucketName }));

    return await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: keyName,
        Body: data,
      })
    );
    console.log("Successfully uploaded data to " + bucketName + "/" + keyName);
  } catch (err) {
    console.log("Error: ", err);
  }
};

// const b2 = new B2({
//   applicationKeyId: process.env.AWS_ACCESS_KEY_ID,
//   applicationKey: process.env.AWS_SECRET_ACCESS_KEY,
// });

// const generateS3Url = async (bucketName, fileName) => {
//   console.log("bucketName, fileName :>> ", bucketName, fileName);
//   await b2.authorize(); // Authorize request

//   const response = await b2.getDownloadAuthorization({
//     bucketId: process.env.BUCKET_ID, // Ensure this is correct
//     fileNamePrefix: fileName, // Ensure this is the correct prefix
//     validDurationInSeconds: 3600, // URL validity duration
//   });

//   console.log("response", response.data);

//   if (!response || !response.data || !response.data.response) {
//     throw new Error("Failed to generate download URL");
//   }

//   return `https://${bucketName}.s3.us-east-005.backblazeb2.com/${fileName}?Authorization=${response.data.response}`;
// };

async function generateS3Url(bucketName, fileName) {
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      ContentType: "application/octet-stream",
    });
    console.log("command :>> ", command);
    // Set the expiration time for the presigned URL (e.g., 60 seconds)
    const url = await getSignedUrl(s3, command, { expiresIn: 86400 });
    return url;
  } catch (error) {
    console.error("Error generating presigned URL: ", error);
    throw error;
  }
}

module.exports = { uploadFile, generateS3Url };
