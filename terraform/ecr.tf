# ECR for auth service docker images
resource "aws_ecr_repository" "auth_service" {
  name = "auth-service"
  image_tag_mutability = "IMMUTABLE"  # Prevents tag overwriting

  image_scanning_configuration {
    scan_on_push = true # Enables automatic vulnerability scanning
  }

  # Need to use KMS?
  encryption_configuration {
    encryption_type = "AES256" # Uses AWS managed encryption keys
  }

  # Prevent deletion of the repository
  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Environment = "production"
    Service     = "auth-service"
  }
}

# Lifecycle policy to keep the last 30 images and less than 14 days old images
resource "aws_ecr_lifecycle_policy" "auth_service" {
  repository = aws_ecr_repository.auth_service.name
  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep untagged images less than 14 days old"
        selection = {   
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 14
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Keep last 30 tagged images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["v"]
          countType     = "imageCountMoreThan"
          countNumber   = 30
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}
