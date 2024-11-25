# Kubernetes provider configuration
provider "kubernetes" {
  # EKS cluster API endpoint
  host                   = module.eks.cluster_endpoint
  
  # EKS cluster CA certificate
  cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)

  # AWS CLI authentication for EKS
  exec {
    api_version = "client.authentication.k8s.io/v1beta1"

    # AWS CLI command
    command     = "aws"

    # Get EKS authentication token
    args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name]
  }
}

# Add this provider for managing the aws-auth ConfigMap
provider "kubectl" {
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)
  load_config_file       = false

  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name, "--region", local.region]
  }
}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"

  cluster_name    = "secure-auth-cluster"
  cluster_version = "1.27" # Update to version 1.28

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  # Allow egress traffic from EKS cluster control plane to worker nodes
  cluster_security_group_additional_rules = {
    egress_nodes_ephemeral_ports_tcp = {
      description                = "Node groups to cluster API"
      protocol                   = "tcp"
      from_port                  = 1025
      to_port                    = 65535
      type                       = "egress"
      source_node_security_group = true
    }
  }

  # Allow ingress traffic between worker nodes in the cluster
  node_security_group_additional_rules = {
    ingress_self_all = {
      description = "Node to node all ports/protocols"
      protocol    = "-1" # Update with whitelist
      from_port   = 0 # Update
      to_port     = 0 # Update
      type        = "ingress"
      self        = true
    }
  }

  # Configure OIDC provider for service account integration
  enable_irsa = true

  eks_managed_node_groups = {
    default = {
      min_size     = 1
      max_size     = 3
      desired_size = 2

      instance_types = ["t3.medium"] # Update to use production-suitable instance type
            
      # Enable detailed monitoring
      enable_monitoring = true

      # Add labels and taints for workload management
      labels = {
        Environment = "production"
      }

      # Enable node group autoscaling
      enable_autoscaling = true

      # TODO: Configure EBS volumes
    }
  }

  # TODO:
  # Enable control plane logging
  # Enable secret encryption using KMS

  # Configure cluster access
  # Note: We should not use wildcard (*) for resources in production
  manage_aws_auth_configmap = true
  aws_auth_roles = [
    {
      rolearn  = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/AdminRole"
      username = "admin"
      groups   = ["system:masters"]
    }
  ]
}
