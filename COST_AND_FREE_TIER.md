# AWS Free Tier & Cost Optimization Guide

**Audience:** Academic Evaluators, Students, and Cloud Architects  
**Project:** Cloud-Based Intelligent Inventory Management & Stock Prediction System  
**Design Philosophy:** Strict Free-Tier Compliance & Zero-Cost Local Development  

---

## 1. Overview of AWS Services Used & Free Tier Allowances

This project is architected exclusively around **serverless and pay-per-use primitives** to guarantee that academic demonstrations and development remain well within AWS Free Tier thresholds.

| AWS Service | Architectural Role | AWS Free Tier Monthly Allowance | Expected Student Demo Usage | Estimated Monthly Cost |
| :--- | :--- | :--- | :--- | :--- |
| **Amazon DynamoDB** | Persistent storage for products, orders, sales, and predictions | **25 GB** storage, **25 Read Capacity Units (RCU)**, **25 Write Capacity Units (WCU)** (Always Free) | < 20 MB storage, < 10,000 queries/month | **$0.00** |
| **AWS Lambda** | Serverless REST API logic and prediction calculation | **1,000,000 requests/month** and **3.2M seconds of compute time** (Always Free) | ~1,000 to 5,000 invocations | **$0.00** |
| **Amazon API Gateway**| REST API endpoints exposed to the frontend | **1,000,000 API calls/month** (12 Months Free) | ~2,000 calls during demo | **$0.00** |
| **Amazon Cognito** | User authentication, JWT tokens, and user pools | **50,000 Monthly Active Users (MAUs)** (Always Free) | < 10 test accounts | **$0.00** |
| **Amazon S3** | Exported CSV and PDF inventory audit reports | **5 GB standard storage**, 20,000 GET requests, 2,000 PUT requests (12 Months Free) | < 10 MB storage, ~50 exports | **$0.00** |
| **AWS Amplify** | Hosting and CDN distribution for React web app | **1,000 build minutes/month**, **5 GB served/month**, **5 GB storage** (12 Months Free) | ~10 builds, < 500 MB bandwidth | **$0.00** |
| **Amazon CloudWatch**| System logs, operational metrics, and error tracking | **5 GB ingestion/month**, 10 custom metrics, 3 alarms (Always Free) | < 100 MB log data | **$0.00** |

---

## 2. Infrastructure Excluded by Design (Cost Avoidance)

The following costly or high-risk services have been **deliberately excluded**:
- **No Amazon EC2 Instances:** Avoids ongoing hourly runtime charges ($10–$50+/month).
- **No Amazon RDS / Aurora:** Avoids continuous database instance charges ($15–$60+/month).
- **No NAT Gateways:** Avoids ~$32/month base charges plus data processing fees.
- **No Elastic Load Balancers (ALB/NLB):** Avoids ~$18+/month fixed costs.
- **No Amazon OpenSearch / ElastiCache:** Avoids cluster hourly hosting costs.
- **No Paid AI/LLM APIs:** Uses self-contained statistical and machine-learning algorithms (SMA, WMA, SES) written in pure Python running inside standard Lambda memory limits (128–256 MB).

---

## 3. Potential Billing Risks & Mitigations

1. **DynamoDB Billing Mode:**
   - *Risk:* Provisioned mode with high RCU/WCU could incur costs if misconfigured beyond 25 RCU/WCU.
   - *Mitigation:* We use **On-Demand Capacity Mode (`PAY_PER_REQUEST`)** for student workloads where traffic is intermittent, or cap provisioned capacity strictly at 5 RCU / 5 WCU.
2. **CloudWatch Log Retention:**
   - *Risk:* Default log groups retain logs forever, eventually accumulating storage fees.
   - *Mitigation:* Explicitly set retention policy to **7 days** or **14 days** on all Lambda log groups.
3. **Repeated Automated Polling:**
   - *Risk:* Infinite frontend polling loops calling API Gateway.
   - *Mitigation:* The frontend uses user-driven refreshes and cached state rather than aggressive interval timers.
4. **S3 Orphaned Files:**
   - *Risk:* Accumulating generated test reports over time.
   - *Mitigation:* S3 lifecycle policy configured to expire demo report objects after 30 days.

---

## 4. Cost Monitoring & Budget Alerts

Before launching in AWS, configure an **AWS Budget** to prevent surprise charges:
1. Open **AWS Billing Console** $\rightarrow$ **Budgets**.
2. Create a **Zero-Spend Budget** or **$1.00 USD Monthly Budget**.
3. Set notification email to receive an alert if forecasted or actual spend exceeds $0.50.

---

## 5. Complete Resource Cleanup Runbook

When the academic evaluation is complete, tear down all provisioned cloud resources using the automated script:
```bash
# Delete CloudFormation stack (deletes Lambda, API Gateway, DynamoDB, Cognito)
aws cloudformation delete-stack --stack-name inventory-prediction-system --region us-east-1

# Empty and delete the S3 reports bucket
aws s3 rm s3://inventory-reports-mtech-storage --recursive
aws s3 rb s3://inventory-reports-mtech-storage
```
Alternatively, developing in **Local Mode (`STORAGE_MODE=local`)** requires zero AWS cloud infrastructure, incurring exactly $0.00 forever.
