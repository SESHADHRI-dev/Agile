#!/usr/bin/env python3
"""
AWS Verification & Health Check Script
Validates AWS credentials, caller identity, and permissions across key services.
"""

import sys
import boto3
from botocore.exceptions import ClientError, NoCredentialsError

def check_aws():
    print("=== AWS Connectivity & Permissions Check ===\n")
    try:
        session = boto3.Session()
        sts = session.client('sts')
        identity = sts.get_caller_identity()
        print(f"Account ID   : {identity.get('Account')}")
        print(f"IAM User ARN : {identity.get('Arn')}")
        print(f"User ID      : {identity.get('UserId')}")
        print(f"Region       : {session.region_name}\n")
    except NoCredentialsError:
        print("[ERROR] No AWS credentials found. Please check ~/.aws/credentials.")
        sys.exit(1)
    except ClientError as e:
        print(f"[ERROR] STS ClientError: {e}")
        sys.exit(1)

    # Test S3 listing
    print("Checking S3 access...")
    try:
        s3 = session.client('s3')
        buckets = s3.list_buckets().get('Buckets', [])
        print(f"[SUCCESS] S3 reachable. Found {len(buckets)} bucket(s).")
        for b in buckets[:5]:
            print(f"  - {b['Name']}")
        if len(buckets) > 5:
            print(f"  ... and {len(buckets) - 5} more")
    except ClientError as e:
        print(f"[WARN] S3 check failed: {e.response.get('Error', {}).get('Message', str(e))}")

    # Test EC2 / Regions
    print("\nChecking EC2 access...")
    try:
        ec2 = session.client('ec2')
        regions = ec2.describe_regions().get('Regions', [])
        print(f"[SUCCESS] EC2 reachable. Accessible regions: {len(regions)}")
    except ClientError as e:
        print(f"[WARN] EC2 check failed: {e.response.get('Error', {}).get('Message', str(e))}")

    print("\n=== Check Complete ===")

if __name__ == '__main__':
    check_aws()
