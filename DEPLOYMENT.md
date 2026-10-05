# AWS Cloud Deployment Guide

**Project:** Cloud-Based Intelligent Inventory Management & Stock Prediction System  
**Deployment Tooling:** AWS CLI, AWS SAM / CloudFormation, AWS Amplify  
**Target AWS Region:** `us-east-1` (or user specified)  

---

## 1. Prerequisites
1. Installed **AWS CLI** and configured credentials (`aws configure` or `~/.aws/credentials`).
2. Installed **Python 3.11+** and **Node.js 18+**.
3. AWS Free Tier eligible account.

---

## 2. Automated CloudFormation / SAM Deployment

The entire backend infrastructure (DynamoDB, S3, Cognito, API Gateway, Lambda, CloudWatch) is defined in [infrastructure/template.yaml](file:///d:/1-fall%2026-27/software%20configuration%20management/scm%20test%20tasks/infrastructure/template.yaml).

### Step 2.1: Package and Deploy Backend
```bash
# Package Lambda function and upload artifacts
sam build -t infrastructure/template.yaml

# Deploy CloudFormation stack with guided prompt
sam deploy --guided --stack-name inventory-prediction-system --region us-east-1
```

During the prompt, configure:
- **Stack Name:** `inventory-prediction-system`
- **AWS Region:** `us-east-1`
- **Parameter Environment:** `dev`
- **Allow SAM CLI IAM role creation:** `Y`

Once complete, note the **Outputs**:
- `ApiUrl`: e.g. `https://xxxxxx.execute-api.us-east-1.amazonaws.com/Prod/api`
- `DynamoDBTableName`: `inventory-management-table-dev`
- `ReportsBucketName`: `inventory-reports-mtech-<account>-dev`
- `CognitoUserPoolId`: `us-east-1_xxxxxxxxx`
- `CognitoClientId`: `xxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## 3. Manual AWS Service Configuration (Console Walkthrough)

If deploying manually via the AWS Management Console:

### 3.1 Amazon DynamoDB
1. Navigate to **DynamoDB Console** $\rightarrow$ **Tables** $\rightarrow$ **Create Table**.
2. **Table Name:** `inventory-management-table-dev`
3. **Partition Key (`PK`):** `PK` (String)
4. **Sort Key (`SK`):** `SK` (String)
5. **Table Class:** Standard.
6. **Capacity Calculator:** Select **On-Demand** (`PAY_PER_REQUEST`).
7. Under **Global Secondary Indexes (GSI)**, click **Create Index**:
   - `GSI1_PK` (Partition Key, String)
   - `GSI1_SK` (Sort Key, String)
   - **Projected Attributes:** All.

### 3.2 Amazon S3
1. Navigate to **S3 Console** $\rightarrow$ **Create Bucket**.
2. **Bucket Name:** `inventory-reports-mtech-storage` (must be globally unique).
3. **Region:** `us-east-1`.
4. Keep **Block Public Access** checked.
5. Create a Lifecycle Rule: Expire demo objects after 30 days.

### 3.3 Amazon Cognito
1. Navigate to **Cognito Console** $\rightarrow$ **User Pools** $\rightarrow$ **Create User Pool**.
2. **Authentication Options:** Email sign-in.
3. **Password Policy:** Minimum 8 characters.
4. **App Client:** Create a client without client secret (Public client for SPA).

### 3.4 AWS Lambda & API Gateway
1. Navigate to **Lambda Console** $\rightarrow$ **Create Function**.
2. **Runtime:** Python 3.11.
3. **Handler:** `lambda.lambda_handler.lambda_handler`.
4. Attach IAM policy allowing `dynamodb:*` on the table and `s3:*` on the reports bucket.
5. Add an **API Gateway Trigger** with a **Proxy Resource (`/{proxy+}`)**.

---

## 4. Deploying Frontend to AWS Amplify

### Step 4.1: Connect Repository & Build
1. Open the **AWS Amplify Console**.
2. Select **Host web app** $\rightarrow$ Connect your GitHub repository.
3. Configure the build settings (`amplify.yml`):
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - cd frontend
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: frontend/dist
       files:
         - '**/*'
     cache:
       paths:
         - frontend/node_modules/**/*
   ```
4. Add environment variables under **Amplify App Settings** $\rightarrow$ **Environment Variables**:
   - `VITE_API_BASE`: `<Your API Gateway URL>`
5. Click **Save and Deploy**. Your web app will be live with a secure SSL HTTPS domain (e.g. `https://dev.xxxxxx.amplifyapp.com`).

---

## 5. Post-Deployment Verification & Testing
1. Visit the deployed Amplify URL.
2. Sign in with the Cognito test credentials.
3. Click **Add Product** $\rightarrow$ verify the record appears in the DynamoDB console.
4. Perform a **Sale** and a **Purchase** $\rightarrow$ verify DynamoDB stock updates.
5. Open the **Prediction** tab and run a forecast.
6. Open **CloudWatch Console** $\rightarrow$ **/aws/lambda/inventory-api-backend-dev** $\rightarrow$ verify execution logs.

---

## 6. Resource Teardown & Cost Cleanup
When evaluation is completed, avoid any ongoing storage accumulation:
```bash
# Delete the CloudFormation stack
aws cloudformation delete-stack --stack-name inventory-prediction-system --region us-east-1

# Empty & delete the S3 bucket
aws s3 rm s3://inventory-reports-mtech-storage --recursive
aws s3 rb s3://inventory-reports-mtech-storage
```
