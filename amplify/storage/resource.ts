// amplify/storage/resource.ts
import { defineFunction, defineStorage } from "@aws-amplify/backend";
import { myDynamoDBFunction } from "../functions/dynamoDB-function/resource";

export const storage = defineStorage({
  name: 'amplifyDashboard',
  access: (allow) => ({
    'attachments/*': [
      allow.authenticated.to(['read', 'write', 'delete']),
      allow.resource(myDynamoDBFunction).to(['delete'])
    ]
  }),
});