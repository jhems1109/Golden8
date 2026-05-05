import { S3Client } from "@aws-sdk/client-s3";
import * as AWS from "@aws-sdk/client-s3";

export const s3Storage = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  
});