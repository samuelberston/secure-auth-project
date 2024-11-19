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