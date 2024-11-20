# S3 Bucket for storing Terraform state
resource "aws_s3_bucket" "terraform_state_bucket" {
  bucket = "secure-auth-tf-state-bucket"

  tags = {
    Name = "secure-auth-tf-state-bucket"
  }
}

# Block public access to the S3
resource "aws_s3_bucket_public_access_block" "terraform_state_bucket_public_access_block" {
  bucket                  = aws_s3_bucket.terraform_state_bucket.id
  block_public_acls       = true
  block_public_policy     = true # Ensure public policies cannot be added
  ignore_public_acls      = true # Ensure AWS accounts can't ignore ACLs
  restrict_public_buckets = true # Restrict public bucket access
}

# Separate resource for enabling versioning
resource "aws_s3_bucket_versioning" "terraform_state_bucket_versioning" {
  bucket = aws_s3_bucket.terraform_state_bucket.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Enable server-side encryption for the S3 bucket
resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state_bucket_sse" {
  bucket = aws_s3_bucket.terraform_state_bucket.bucket

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# DynamoDB table for state locking
resource "aws_dynamodb_table" "terraform_locks" {
  name         = "terraform-state-locks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name = "terraform-locks"
  }
}