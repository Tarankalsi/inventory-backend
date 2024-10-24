import { S3Client } from "@aws-sdk/client-s3";

const region = process.env.REGION
const accessKeyId = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY
console.log('region:', region)
console.log('secretAccessKey:', secretAccessKey)
console.log('accessKey:', accessKeyId)
console.log('s3 bucket name:', process.env.S3_BUCKET_NAME)
if (!region && !accessKeyId && !secretAccessKey) {
    throw new Error('AWS_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY must be defined in the environment variables');
  }

  const config = {
    region: region,
    credentials :{
        accessKeyId: accessKeyId as string,
        secretAccessKey: secretAccessKey as string
    }
  }
  
  export const s3 = new S3Client(config);