// amplify/data/resource.ts
import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Transaction: a
    .model({
      description: a.string(),
      type: a.enum(["expense", "income"]),
      date: a.date(),
      amount: a.float(),
      attachmentPath: a.string()
    }).authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
