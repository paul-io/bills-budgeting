// amplify/functions/dynamoDB-function/resource.ts
import { defineFunction } from "@aws-amplify/backend";

export const myDynamoDBFunction = defineFunction({
  name: "dynamoDB-function",
});