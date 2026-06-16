#!/usr/bin/env node
/**
 * Mindora DynamoDB Table Setup Script
 * Run with: node -r @swc/register scripts/setup-dynamo.ts
 * Or compile first: npx tsc scripts/setup-dynamo.ts --outDir dist/scripts
 */

const {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
} = require("@aws-sdk/client-dynamodb");

require("dotenv").config({ path: ".env.local" });

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const TABLES = [
  {
    TableName: "mindora-users",
    KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
    AttributeDefinitions: [
      { AttributeName: "userId", AttributeType: "S" },
      { AttributeName: "email", AttributeType: "S" },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "email-index",
        KeySchema: [{ AttributeName: "email", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
    BillingMode: "PAY_PER_REQUEST",
  },
  {
    TableName: "mindora-moods",
    KeySchema: [
      { AttributeName: "userId", KeyType: "HASH" },
      { AttributeName: "entryId", KeyType: "RANGE" },
    ],
    AttributeDefinitions: [
      { AttributeName: "userId", AttributeType: "S" },
      { AttributeName: "entryId", AttributeType: "S" },
      { AttributeName: "date", AttributeType: "S" },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "date-index",
        KeySchema: [
          { AttributeName: "userId", KeyType: "HASH" },
          { AttributeName: "date", KeyType: "RANGE" },
        ],
        Projection: { ProjectionType: "ALL" },
      },
    ],
    BillingMode: "PAY_PER_REQUEST",
  },
  {
    TableName: "mindora-journal",
    KeySchema: [
      { AttributeName: "userId", KeyType: "HASH" },
      { AttributeName: "entryId", KeyType: "RANGE" },
    ],
    AttributeDefinitions: [
      { AttributeName: "userId", AttributeType: "S" },
      { AttributeName: "entryId", AttributeType: "S" },
    ],
    BillingMode: "PAY_PER_REQUEST",
  },
  {
    TableName: "mindora-chat",
    KeySchema: [
      { AttributeName: "userId", KeyType: "HASH" },
      { AttributeName: "messageId", KeyType: "RANGE" },
    ],
    AttributeDefinitions: [
      { AttributeName: "userId", AttributeType: "S" },
      { AttributeName: "messageId", AttributeType: "S" },
      { AttributeName: "sessionId", AttributeType: "S" },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "session-index",
        KeySchema: [
          { AttributeName: "userId", KeyType: "HASH" },
          { AttributeName: "sessionId", KeyType: "RANGE" },
        ],
        Projection: { ProjectionType: "ALL" },
      },
    ],
    BillingMode: "PAY_PER_REQUEST",
  },
  {
    TableName: "mindora-subscriptions",
    KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
    AttributeDefinitions: [
      { AttributeName: "userId", AttributeType: "S" },
    ],
    BillingMode: "PAY_PER_REQUEST",
  },
];

async function tableExists(name) {
  try {
    await client.send(new DescribeTableCommand({ TableName: name }));
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log("Setting up Mindora DynamoDB tables...\n");
  for (const table of TABLES) {
    const exists = await tableExists(table.TableName);
    if (exists) {
      console.log(`[SKIP]    ${table.TableName} — already exists`);
      continue;
    }
    try {
      await client.send(new CreateTableCommand(table));
      console.log(`[CREATED] ${table.TableName}`);
    } catch (err) {
      console.error(`[ERROR]   ${table.TableName}:`, err.message);
    }
  }
  console.log("\nDynamoDB setup complete!");
}

main().catch(console.error);
