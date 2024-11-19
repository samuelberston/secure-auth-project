provider "aws" {
  region = var.region
}

module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "secure-auth-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["${var.region}a", "${var.region}b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway = true
}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"

  cluster_name    = "secure-auth-cluster"
  cluster_version = "1.27"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  eks_managed_node_groups = {
    default = {
      min_size     = 1
      max_size     = 3
      desired_size = 2

      instance_types = ["t3.medium"]
    }
  }
}

// Security group for RDS
resource "aws_security_group" "rds" {
  name        = "secure-auth-rds-sg"
  description = "Security group for RDS instance"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [module.eks.cluster_security_group_id]
  }
}

// RDS subnet group
resource "aws_db_subnet_group" "rds" {
  name       = "secure-auth-rds-subnet-group"
  subnet_ids = module.vpc.private_subnets
}

// RDS instance
resource "aws_db_instance" "postgres" {
  identifier        = "secure-auth-db"
  engine            = "postgres"
  engine_version    = "14.7"
  instance_class    = "db.t3.micro"  // Adjust based on your needs
  allocated_storage = 20

  db_name  = "secureauthdb"
  // Update to use AWS Secrets Manager
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.rds.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  skip_final_snapshot = true  // Set to false for production

  # Disable public access
  publicly_accessible = false

  tags = {
    Name = "secure-auth-postgres-rds"
  }
}