---
name: aws-operations
description: >-
  Manage, inspect, and deploy AWS infrastructure (S3, ECS, EC2, CloudWatch, Lambda, IAM)
  using the AWS CLI and Boto3. Use when the user asks to run AWS commands, inspect cloud resources,
  deploy services, or query AWS data.
---

# AWS Operations & Cloud Infrastructure Skill

This skill guides Antigravity on managing AWS resources safely and effectively using the configured AWS credentials.

## Credentials & Environment
- **Profile**: `default` (configured in `~/.aws/credentials` and `~/.aws/config`)
- **Default Region**: `us-east-1` (or specified via `--region`)
- **Active IAM Principal**: `arn:aws:iam::897258608555:user/AntiGravity`

---

## Safety Guardrails

1. **Read-Only First**: Always prefer non-destructive inspection (`describe-`, `list-`, `get-`) before applying modifications.
2. **Explicit User Confirmation**: Always prompt the user before deleting, terminating, or modifying existing stateful resources:
   - Terminating EC2 instances or ECS tasks
   - Deleting S3 buckets or data
   - Modifying IAM policies, security groups, or route tables
3. **Credentials Privacy**: Never print or echo raw Access Keys or Secret Keys in outputs, scripts, or commit history.

---

## Common Workflows

### 1. Verification & Identity
Verify active credentials and account context:
```bash
aws sts get-caller-identity
```

### 2. S3 Storage
- List buckets:
  ```bash
  aws s3 ls
  ```
- List contents of a bucket:
  ```bash
  aws s3 ls s3://<bucket-name>/
  ```
- Upload or sync files:
  ```bash
  aws s3 sync ./local-dir s3://<bucket-name>/target-path
  ```

### 3. Container & Architecture Deployments (ECS / ECR)
- List ECS clusters:
  ```bash
  aws ecs list-clusters
  ```
- List container repositories in ECR:
  ```bash
  aws ecr describe-repositories
  ```
- Authenticate Docker to Amazon ECR:
  ```bash
  aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account_id>.dkr.ecr.us-east-1.amazonaws.com
  ```

### 4. CloudWatch Logs & Diagnostics
- List log groups:
  ```bash
  aws logs describe-log-groups --query "logGroups[*].logGroupName" --output table
  ```
- Fetch recent log events from a stream:
  ```bash
  aws logs get-log-events --log-group-name "<log-group>" --log-stream-name "<stream-name>" --limit 50
  ```

### 5. Automated Python Tasks (`boto3`)
Use Python scripts in the `scripts/` directory for structured queries and JSON manipulation:
- Run [verify_aws.py](file:///d:/1-fall%2026-27/software%20configuration%20management/scm%20test%20tasks/.agents/skills/aws-operations/scripts/verify_aws.py) to check connectivity and list available services.
