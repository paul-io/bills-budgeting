<div align="center">

# Bills Budgeting

**A full-stack personal finance app deployed on AWS featuring real-time sync, S3 file storage, and a serverless backend provisioned with Amplify Gen 2.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Available-4CAF50?style=flat&logo=amazonaws&logoColor=white)](https://master.ddu5dedoqfjsz.amplifyapp.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![AWS Amplify](https://img.shields.io/badge/AWS-Amplify%20Gen%202-FF9900?logo=amazonaws&logoColor=white)](https://docs.amplify.aws/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[**→ Try the Live App**](https://master.ddu5dedoqfjsz.amplifyapp.com/)

---

![Demo GIF](./docs/Demo.gif)

</div>

---

## Demo Account

A pre-populated read-only account is available to explore the app without signing up:

| Field | Value |
|---|---|
| Email | `DemoUser@example.com` |
| Password | `Password123!` |

---

## Architecture

![Architecture Diagram](./docs/architecture.png)

---

## Features

- **Transaction Management** — create, edit, and delete income and expense entries with real-time sync across sessions
- **File Attachments** — upload receipts and documents to any transaction, stored securely in S3
- **Real-Time Updates** — changes appear instantly via AppSync subscriptions, no page refresh required
- **Analytics Dashboard** — visualize spending patterns with bar, line, and area charts filtered by date range or transaction type
- **CSV Export** — download any filtered transaction view for use in external tools
- **Authentication** — Cognito user pools with owner-based data access rules; your data is isolated to your account

---

## Tech Stack

**Frontend**
- React 18 + TypeScript
- Mantine UI
- AWS Amplify Client Library
- Vite

**Backend (AWS)**
- Amplify Gen 2 — infrastructure-as-code, backend resources defined in TypeScript
- AppSync — GraphQL API with real-time subscription support
- Cognito — user authentication and authorization
- DynamoDB — NoSQL data storage
- S3 — file attachment storage
- Lambda — serverless functions
- CloudWatch — logging and monitoring

---

## Technical Challenges

### Race Condition: Hook Initializing Before Auth
`useTransactions` was calling `observeQuery()` before authentication completed, causing AWS to reject requests since no owner token existed yet. Fixed by ensuring the hook only initializes after the `Authenticator` component confirms the user's session, reinforcing the importance of explicitly sequencing initialization with auth state.

### Circular Dependency in CloudFormation
Lambda, DynamoDB, and S3 created a circular dependency during deployment: Lambda referenced the S3 bucket, which depended on the data stack, which included Lambda. Resolved by removing S3 access from Lambda entirely and handling file cleanup on the frontend before transaction deletion. Simpler architecture, no tight coupling.

### Auth State Changes Not Propagating to Subscriptions
When a user signed out and a different account signed in, the previous user's transactions persisted until page refresh. The AppSync subscription wasn't re-initializing because the effect dependency array wasn't responding to auth state changes. Solved by using Amplify Hub to listen for `signedIn` and `signedOut` events and manually re-initializing the subscription showing real-time systems require explicit lifecycle management that doesn't happen automatically.

---

## Project Structure

```
src/
├── components/
│   ├── dashboard/           # Summary cards and charts
│   ├── transactions/        # CRUD interface, filters, table
│   ├── layout/              # App shell, header, nav
│   └── shared/              # Reusable UI components
├── hooks/
│   ├── useTransactions.ts       # CRUD operations and CSV export
│   └── useTransactionFilters.ts # Sorting, filtering, search
└── utils/
    ├── types.ts             # TypeScript definitions
    ├── constants.ts         # App-wide constants
    └── formatters.ts        # Date and currency formatting

amplify/
├── auth/                    # Cognito configuration
├── data/                    # GraphQL schema and DynamoDB setup
├── storage/                 # S3 bucket configuration
└── functions/               # Lambda handlers
```

---

## Run Locally

**Prerequisites:** Node.js 18+, AWS account, AWS CLI configured

```bash
git clone https://github.com/paul-io/bills-budgeting.git
cd bills-budgeting
npm install

# In one terminal start the cloud sandbox (provisions isolated AWS backend)
npx @aws-amplify/backend-cli sandbox

# In another terminal start the frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Deployment

Connected to Amplify's CI/CD pipeline every push to `main` triggers a full frontend and backend deployment automatically.

```bash
npx ampx pipeline-deploy --branch main
```

---

## Roadmap

- [ ] **Bank Integration** — connect via Plaid to auto-import transactions
- [ ] **Smart Receipt Scanning** — use AWS Textract to extract amounts and descriptions from uploaded documents
- [ ] **Budget Alerts** — set monthly spending limits per category with notifications
- [ ] **Recurring Transactions** — auto-create repeat entries for rent, subscriptions, etc.
- [ ] **Monthly Email Reports** — scheduled spending summaries with trend insights

---

## License

MIT © [Paul](https://github.com/paul-io)