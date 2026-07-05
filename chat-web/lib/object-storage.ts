import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY ?? "",
    secretAccessKey: process.env.S3_SECRET_KEY ?? "",
  },
  forcePathStyle: true,
});

function getBucketName() {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) {
    throw new Error("Missing S3_BUCKET environment variable");
  }

  return bucket;
}

export async function uploadObject(params: {
  key: string;
  contentType: string;
  body: Buffer | Uint8Array | string;
}) {
  const command = new PutObjectCommand({
    Bucket: getBucketName(),
    Key: params.key,
    ContentType: params.contentType,
    Body: params.body,
  });

  await s3Client.send(command);

  return {
    bucket: getBucketName(),
    key: params.key,
  };
}

export async function getUploadUrl(key: string, contentType: string, expiresInSeconds = 300) {
  const command = new PutObjectCommand({
    Bucket: getBucketName(),
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

export async function getDownloadUrl(key: string, expiresInSeconds = 300) {
  const command = new GetObjectCommand({
    Bucket: getBucketName(),
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}
