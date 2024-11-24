module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "secure-auth-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["${var.region}b", "${var.region}c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway = true

  enable_dns_hostnames = true
  enable_dns_support   = true
  
  # Add IAM role for VPC flow logs
  enable_flow_log                      = true
  create_flow_log_cloudwatch_iam_role = true
  create_flow_log_cloudwatch_log_group = true
  flow_log_destination_type            = "cloud-watch-logs"
  flow_log_cloudwatch_log_group_name_prefix = "/aws/vpc-flow-logs/"

  tags = {
    Environment = "production"
    ManagedBy   = "terraform"
  }
}
