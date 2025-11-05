// amplify/functions/dynamoDB-function/handler.ts
import type { DynamoDBStreamHandler } from "aws-lambda";
import AWS from "aws-sdk";
import outputs from "../../../amplify_outputs.json";

const s3 = new AWS.S3();

export const handler: DynamoDBStreamHandler = async (event) => {
  const bucketName = outputs.storage.bucket_name;
  if (!bucketName) {
    console.error("S3_BUCKET_NAME not set in environment");
    throw new Error("Missing S3 bucket name");
  }

  for (const record of event.Records) {
    console.info(`Processing record ID: ${record.eventID}`);
    console.info(`Event Name: ${record.eventName}`);

    if (record.eventName === "REMOVE") {
      const oldImage = AWS.DynamoDB.Converter.unmarshall(record.dynamodb?.OldImage || {});
      const attachmentPath: string | undefined = oldImage.attachmentPath;

      if (attachmentPath) {
        try {
          console.info(`Deleting S3 object: Bucket=${bucketName}, Key=${attachmentPath}`);
          await s3.deleteObject({
            Bucket: bucketName,
            Key: attachmentPath,
          }).promise();
          console.info(`Successfully deleted S3 object: ${attachmentPath}`);
        } catch (error) {
          console.error(`Error deleting S3 object: ${error}`);
        }
      } else {
        console.info('No attachmentPath found for the deleted transaction.');
      }
    }
  }
  console.info(`Successfully processed ${event.Records.length} records.`);
  return {
    batchItemFailures: [],
  };
};
