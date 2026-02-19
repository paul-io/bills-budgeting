// amplify/functions/dynamoDB-function/handler.ts
import type { DynamoDBStreamHandler } from "aws-lambda";

export const handler: DynamoDBStreamHandler = async (event) => {
  console.info(`Processing ${event.Records.length} DynamoDB stream records`);
  
  for (const record of event.Records) {
    console.info(`Record ID: ${record.eventID}`);
    console.info(`Event Name: ${record.eventName}`);
    
    if (record.eventName === "REMOVE") {
      const oldImage = record.dynamodb?.OldImage;
      console.info(`Transaction deleted:`, JSON.stringify(oldImage));
    } else if (record.eventName === "MODIFY") {
      console.info(`Transaction modified`);
    } else if (record.eventName === "INSERT") {
      console.info(`Transaction created`);
    }
  }
  
  console.info(`Successfully processed ${event.Records.length} records.`);
  return {
    batchItemFailures: [],
  };
};