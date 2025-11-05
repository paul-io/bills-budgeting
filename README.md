# Bills

A full-stack expense tracking application built with AWS Amplify Gen 2, React, and TypeScript. Tracks income and expenses with file attachments, real-time updates, and detailed analytics.

[Live Demo](#) • [Video Walkthrough](#)

## Architecture

Built entirely on AWS infrastructure:

```
┌─────────────┐
│   React +   │
│  TypeScript │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Cognito   │ ◄── User authentication
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   AppSync   │ ◄── GraphQL API with real-time subscriptions
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  DynamoDB   │ ◄── Transaction storage
└──────┬──────┘
       │
       ▼ (Streams)
┌─────────────┐
│   Lambda    │ ◄── Automatic cleanup of S3 attachments
└──────┬──────┘
       │
       ▼
┌─────────────┐
│     S3      │ ◄── File attachment storage
└─────────────┘
```

## Key Features

### Security
- Owner-based authorization via Cognito - users only see their own data
- API requests authenticated through IAM roles
- S3 attachments scoped to authenticated users
- Budget alerts configured to prevent runaway costs

### File Attachments
- Upload receipts, invoices, or documents with transactions
- Stored in S3 with automatic cleanup when transactions are deleted
- Lambda function triggered by DynamoDB Streams handles orphaned files

### Real-Time Sync
- AppSync subscriptions push updates across all active sessions
- No polling required - changes appear instantly
- Built-in conflict resolution through DynamoDB

### Analytics
- Income vs expense trends with configurable time periods
- Visual breakdowns via charts (daily/weekly/monthly/yearly views)
- Export filtered data to CSV

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Mantine UI component library
- AWS Amplify client libraries

**Backend (AWS):**
- Amplify Gen 2 for infrastructure as code
- Cognito for authentication
- AppSync for GraphQL API
- DynamoDB for data storage
- Lambda for serverless functions
- S3 for file storage

**Development:**
- Vite for build tooling
- Custom hooks for state management
- Modular component architecture

## Local Development

```bash
# Clone the repo
git clone https://github.com/redas4/bills.git
cd bills

# Install dependencies
npm install

# Start Amplify sandbox (deploys backend to AWS)
npx ampx sandbox

# In another terminal, start the dev server
npm run dev
```

The sandbox creates an isolated backend environment tied to your AWS account. You'll need:
- An AWS account
- AWS CLI configured with credentials
- Node.js 18+

## Deployment

Uses Amplify's pipeline deployment for production:

```bash
npx ampx pipeline-deploy --branch main
```

This creates separate environments for sandbox (dev) and production, with isolated databases and auth pools.

## Project Structure

```
src/
├── components/
│   ├── dashboard/       # Summary cards, charts
│   ├── transactions/    # CRUD interface, filters, table
│   ├── layout/          # App shell, header, nav
│   └── shared/          # Reusable components
├── hooks/
│   ├── useTransactions.ts       # CRUD operations, CSV export
│   └── useTransactionFilters.ts # Sorting, filtering, search
└── utils/
    ├── types.ts         # TypeScript definitions
    ├── constants.ts     # App-wide constants
    └── formatters.ts    # Date/currency formatting

amplify/
├── auth/         # Cognito configuration
├── data/         # GraphQL schema, DynamoDB setup
├── storage/      # S3 bucket configuration
└── functions/    # Lambda handlers
```

## Implementation Notes

**Why DynamoDB Streams + Lambda?**

When a user deletes a transaction, the attached file in S3 needs cleanup. Rather than handling this in the client (unreliable) or AppSync resolver (complex), I set up a DynamoDB Stream that triggers a Lambda function. The function reads the deleted record, extracts the S3 path, and removes the file. This guarantees cleanup even if the client disconnects mid-request.

**Why Owner-Based Authorization?**

Initially used API key auth for faster development. Switched to Cognito owner-based rules before production to ensure data isolation. Each transaction is tagged with the creating user's ID, and AppSync automatically filters queries. This prevents data leaks without custom resolver logic.

**Modular Architecture**

Originally built as a single 700-line component. Refactored into custom hooks and smaller components to improve maintainability and demonstrate production-quality code organization.

## Security Considerations

This app is built for portfolio demonstration. In production, I'd add:
- WAF rules to block malicious traffic
- CloudWatch dashboards for monitoring
- Automated backups for DynamoDB
- Tighter S3 bucket policies

Current setup includes budget alerts and rate limiting through Cognito to prevent abuse.

## License

MIT

---

Built by Paulo Ioffreda • [GitHub](https://github.com/redas4)