// // amplify/functions/dynamoDB-function/resource.ts
// import { defineFunction } from "@aws-amplify/backend";
// import outputs from "../../../amplify_outputs.json";

// const bucketName = outputs.storage.bucket_name;

// export const myDynamoDBFunction = defineFunction({
//   name: "dynamoDB-function",
//   environment: {
//     S3_BUCKET_NAME: bucketName,
//   }
// });

// import { defineFunction } from "@aws-amplify/backend";

// export const myDynamoDBFunction = defineFunction({
//   name: "dynamoDB-function",
//   environment: {
//     S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || "",
//   }
// });

import { defineFunction } from "@aws-amplify/backend";

export const myDynamoDBFunction = defineFunction({
  name: "dynamoDB-function",
});