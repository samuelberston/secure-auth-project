variable "region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-west-1"
}

variable "db_username" {
  description = "Database administrator username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database administrator password"
  type        = string
  sensitive   = true
}