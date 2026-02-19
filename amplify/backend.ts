// // amplify/backend.ts
// import { defineBackend } from "@aws-amplify/backend";
// import { auth } from "./auth/resource";
// import { data } from "./data/resource";
// import { storage } from "./storage/resource";
// import { myDynamoDBFunction } from "./functions/dynamoDB-function/resource";

// import { Stack } from "aws-cdk-lib";
// import { Policy, PolicyStatement, Effect } from "aws-cdk-lib/aws-iam";
// import { StartingPosition, EventSourceMapping } from "aws-cdk-lib/aws-lambda";

// const backend = defineBackend({
//   auth,
//   data,
//   storage,
//   myDynamoDBFunction,
// });

// // Get the S3 bucket and pass it to Lambda
// const storageResource = backend.storage.resources.bucket;
// backend.myDynamoDBFunction.addEnvironment("S3_BUCKET_NAME", storageResource.bucketName);

// // Retrieve the DynamoDB table from the data resource
// const transactionTable = backend.data.resources.tables["Transaction"];

// // Define IAM Policy for DynamoDB Streams
// const policy = new Policy(Stack.of(transactionTable), "MyDynamoDBFunctionStreamingPolicy", {
//   statements: [
//     new PolicyStatement({
//       effect: Effect.ALLOW,
//       actions: [
//         "dynamodb:DescribeStream",
//         "dynamodb:GetRecords",
//         "dynamodb:GetShardIterator",
//         "dynamodb:ListStreams",
//       ],
//       resources: [transactionTable.tableStreamArn!],
//     }),
//   ],
// });

// // Attach the policy to the Lambda function's role
// backend.myDynamoDBFunction.resources.lambda.role?.attachInlinePolicy(policy);

// // Create Event Source Mapping
// const mapping = new EventSourceMapping(Stack.of(transactionTable), "MyDynamoDBFunctionTodoEventStreamMapping", {
//   target: backend.myDynamoDBFunction.resources.lambda,
//   eventSourceArn: transactionTable.tableStreamArn!,
//   startingPosition: StartingPosition.LATEST,
// });

// mapping.node.addDependency(policy);


// import { defineBackend } from "@aws-amplify/backend";
// import { auth } from "./auth/resource";
// import { data } from "./data/resource";
// import { storage } from "./storage/resource";

// const backend = defineBackend({
//   auth,
//   data, 
//   storage,
// });

// amplify/backend.ts
import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { storage } from "./storage/resource";
import { myDynamoDBFunction } from "./functions/dynamoDB-function/resource";

import { Stack } from "aws-cdk-lib";
import { Policy, PolicyStatement, Effect } from "aws-cdk-lib/aws-iam";
import { StartingPosition, EventSourceMapping } from "aws-cdk-lib/aws-lambda";

const backend = defineBackend({
  auth,
  data,
  storage,
  myDynamoDBFunction,
});

// Retrieve the DynamoDB table from the data resource
const transactionTable = backend.data.resources.tables["Transaction"];

// Define IAM Policy for DynamoDB Streams
const policy = new Policy(Stack.of(transactionTable), "MyDynamoDBFunctionStreamingPolicy", {
  statements: [
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        "dynamodb:DescribeStream",
        "dynamodb:GetRecords",
        "dynamodb:GetShardIterator",
        "dynamodb:ListStreams",
      ],
      resources: [transactionTable.tableStreamArn!],
    }),
  ],
});

// Attach the policy to the Lambda function's role
backend.myDynamoDBFunction.resources.lambda.role?.attachInlinePolicy(policy);

// Create Event Source Mapping
const mapping = new EventSourceMapping(Stack.of(transactionTable), "MyDynamoDBFunctionTodoEventStreamMapping", {
  target: backend.myDynamoDBFunction.resources.lambda,
  eventSourceArn: transactionTable.tableStreamArn!,
  startingPosition: StartingPosition.LATEST,
});

mapping.node.addDependency(policy);