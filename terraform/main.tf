terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 3.0"
    }
  }
  required_version = ">= 1.0.0"
  backend "s3" {
    bucket         = "secure-auth-tf-state-bucket"
    key            = "state/terraform.tfstate" # Path in the bucket where the state file is stored
    region         = "us-west-1"               # AWS region where the S3 bucket is located
    dynamodb_table = "terraform-state-locks"   # DynamoDB table for state locking
    encrypt        = true                      # Enable encryption for state file
  }
}

provider "aws" {
  region = "us-west-1"
}

# Data block to retrieve the AWS account ID
data "aws_caller_identity" "current" {}
