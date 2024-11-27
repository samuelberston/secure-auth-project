provider "kubernetes" {
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)

  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name]
  }
}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0" # Update

  cluster_name    = "secure-auth-cluster"
  cluster_version = "1.29" # Update to 1.29

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

  # Node security group rules
  node_security_group_additional_rules = {
    # Node to node communication
    ingress_self_all = {
      description = "Node to node all ports/protocols"
      protocol    = "tcp"
      from_port   = 443
      to_port     = 443
      type        = "ingress"
      self        = true
    }

    # Kubelet communication
    ingress_cluster_kubelet = {
      description                = "Cluster to node kubelet"
      protocol                   = "tcp"
      from_port                  = 10250
      to_port                    = 10250
      type                       = "ingress"
      source_cluster_security_group = true
    }
    
    # Node to cluster API
    egress_cluster_443 = {
      description                = "Node to cluster API"
      protocol                   = "tcp"
      from_port                  = 443
      to_port                    = 443
      type                       = "egress"
      source_cluster_security_group = true
    }
  }

  # Configure OIDC provider for service account integration
  enable_irsa = true

  # KMS for cluster secrets encryption
  create_kms_key = false # Manage in kms.tf file
  cluster_encryption_config = {
    provider_key_arn = aws_kms_key.eks.arn
    resources        = ["secrets"]
  }

  # Update to use the IAM roles we've created
  iam_role_arn = aws_iam_role.eks_cluster_role.arn

  # Add cluster addons - coredns etc

  eks_managed_node_groups = {
    default = {
      min_size     = 1
      max_size     = 3
      desired_size = 2

      instance_types = ["t3.medium"] # Not suitable for production
      iam_role_arn   = aws_iam_role.eks_node_group_role.arn

      # Add launch template configuration
      create_launch_template = true
      launch_template_name   = "eks-managed-node-group"
      launch_template_description = "EKS managed node group launch template"
      update_launch_template_default_version = true
      launch_template_tags = {
        Name = "eks-managed-node-group-template"
      }
      
      block_device_mappings = {
        xvda = {
          device_name = "/dev/xvda"
          ebs = {
            volume_size           = 50
            volume_type          = "gp3"
            delete_on_termination = true
          }
        }
      }

      # User data configuration
      enable_bootstrap_user_data = true
      pre_bootstrap_user_data = <<-EOT
        #!/bin/bash
        set -e
        # Set required environment variables
        B64_CLUSTER_CA=${module.eks.cluster_certificate_authority_data}
        API_SERVER_URL=${module.eks.cluster_endpoint}
        
        # Call EKS bootstrap script with proper parameters
        /etc/eks/bootstrap.sh ${module.eks.cluster_name} \
          --b64-cluster-ca $B64_CLUSTER_CA \
          --apiserver-endpoint $API_SERVER_URL \
          --container-runtime containerd
      EOT

      # IAM instance profile configuration
      create_iam_instance_profile = true
      iam_instance_profile_arn    = aws_iam_instance_profile.eks_node_group.arn
      
      # Required tags
      tags = {
        "k8s.io/cluster-autoscaler/enabled" = "true"
        "k8s.io/cluster-autoscaler/${module.eks.cluster_name}" = "owned"
      }
    }
  }

  # Configure cluster access with IAM roles
  # manage_aws_auth_configmap = false
}
