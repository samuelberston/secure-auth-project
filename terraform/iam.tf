# Admin role for cluster access
resource "aws_iam_role" "eks_admin" {
  name = "eks-admin-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          AWS = [
            "arn:aws:iam::${data.aws_caller_identity.current.account_id}:user/secure-auth-user"
          ]
        }
      }
    ]
  })
}

# Add ECR permissions to the admin role
resource "aws_iam_role_policy" "eks_admin_ecr" {
  name = "eks-admin-ecr"
  role = aws_iam_role.eks_admin.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:GetRepositoryPolicy",
          "ecr:DescribeRepositories",
          "ecr:ListImages",
          "ecr:DescribeImages",
          "ecr:BatchGetImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "ecr:PutImage"
        ]
        Resource = [
          "arn:aws:ecr:us-west-1:${data.aws_caller_identity.current.account_id}:repository/auth-service"
        ]
      },
      {
        Effect = "Allow"
        Action = "ecr:GetAuthorizationToken",
        Resource = "*"
      }
    ]
  })
}

# KMS permissions for the admin role
resource "aws_iam_role_policy" "eks_admin_kms" {
  name = "eks-admin-kms"
  role = aws_iam_role.eks_admin.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "kms:Create*",
          "kms:Describe*",
          "kms:Enable*",
          "kms:List*",
          "kms:Put*",
          "kms:Update*",
          "kms:Revoke*",
          "kms:Disable*",
          "kms:Get*",
          "kms:Delete*",
          "kms:ScheduleKeyDeletion",
          "kms:CancelKeyDeletion"
        ]
        Resource = [
          aws_kms_key.eks.arn,
          "arn:aws:kms:us-west-1:${data.aws_caller_identity.current.account_id}:alias/eks-secrets"
        ]
      }
    ]
  })
}

# Policy allowing EKS cluster administration
resource "aws_iam_role_policy" "eks_admin" {
  name = "eks-admin-policy"
  role = aws_iam_role.eks_admin.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "eks:AccessKubernetesApi",
          "eks:DescribeCluster",
          "eks:ListClusters",
          "eks:UpdateClusterConfig",
          "eks:UpdateClusterVersion",
          "eks:ListNodegroups",
          "eks:DescribeNodegroup",
          "eks:UpdateNodegroupConfig",
          "eks:UpdateNodegroupVersion"
        ]
        Resource = [
          module.eks.cluster_arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "ec2:RunInstances",
          "ec2:DescribeLaunchTemplates",
          "ec2:DescribeLaunchTemplateVersions"
        ]
        Resource = "*"
      }
    ]
  })
}

# Allow secure-auth-user to assume the admin role
resource "aws_iam_user_policy" "allow_assume_eks_admin" {
  name = "allow-assume-eks-admin"
  user = "secure-auth-user"  # Existing AWS user

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = "sts:AssumeRole"
        Resource = aws_iam_role.eks_admin.arn
      }
    ]
  })
}

# EKS Cluster IAM Role
resource "aws_iam_role" "eks_cluster_role" {
  name = "eks-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "eks.amazonaws.com"
      }
    }]
  })
}

# Attach required AWS managed policies to the EKS cluster role
resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_cluster_role.name
}

# EKS Node Group IAM Role
resource "aws_iam_role" "eks_node_group_role" {
  name = "eks-node-group-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })
}

# Attach required AWS managed policies to the node group role
resource "aws_iam_role_policy_attachment" "eks_worker_node_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.eks_node_group_role.name
}

resource "aws_iam_role_policy_attachment" "eks_cni_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.eks_node_group_role.name
}

resource "aws_iam_role_policy_attachment" "eks_container_registry_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.eks_node_group_role.name
}

# Add KMS permissions to cluster role
resource "aws_iam_role_policy" "eks_cluster_kms" {
  name = "eks-cluster-kms"
  role = aws_iam_role.eks_cluster_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:DescribeKey",
          "kms:Encrypt",
          "kms:GenerateDataKey*",
          "kms:CreateGrant",
          "kms:ListGrants",
          "kms:RevokeGrant"
        ]
        Resource = [aws_kms_key.eks.arn]
      }
    ]
  })
}

# Add KMS permissions to node group role
resource "aws_iam_role_policy" "eks_node_kms" {
  name = "eks-node-kms"
  role = aws_iam_role.eks_node_group_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:DescribeKey",
          "kms:Encrypt",
          "kms:GenerateDataKey*"
        ]
        Resource = [aws_kms_key.eks.arn]
      }
    ]
  })
}

# eks_node_group_role launch template policy
resource "aws_iam_role_policy" "node_group_launch_template" {
  name = "eks-node-group-launch-template"
  role = aws_iam_role.eks_node_group_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ec2:RunInstances",
          "ec2:CreateTags",
          "ec2:DescribeLaunchTemplates",
          "ec2:DescribeLaunchTemplateVersions",
          "ec2:DescribeInstances",
          "ec2:DescribeSecurityGroups",
          "ec2:DescribeSubnets",
          "ec2:DescribeInstanceTypes",
          "ec2:DescribeInstanceTypeOfferings",
          "ec2:DescribeAvailabilityZones",
          "ec2:CreateLaunchTemplate",
          "ec2:DeleteLaunchTemplate",
          "ec2:CreateFleet",
          "ec2:CreateTags",
          "ec2:DescribeImages",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DescribeVolumes",
          "ec2:DescribeVpcs",
          "iam:PassRole",
          "iam:CreateServiceLinkedRole",
          "elasticloadbalancing:DescribeLoadBalancers",
          "elasticloadbalancing:DescribeTargetGroups",
          "elasticloadbalancing:DescribeTargetHealth"
        ]
        Resource = "*"
      }
    ]
  })
}


# Add this new policy to allow the cluster to manage node groups
resource "aws_iam_role_policy" "cluster_node_group_policy" {
  name = "eks-cluster-node-group"
  role = aws_iam_role.eks_cluster_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ec2:DescribeLaunchTemplates",
          "ec2:DescribeLaunchTemplateVersions",
          "ec2:CreateLaunchTemplate",
          "ec2:DeleteLaunchTemplate",
          "iam:PassRole",
          "eks:*"
        ]
        Resource = "*"
      }
    ]
  })
}

# eks_node_group_role autoscaling policy
resource "aws_iam_role_policy" "node_group_autoscaling" {
  name = "eks-node-group-autoscaling"
  role = aws_iam_role.eks_node_group_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "autoscaling:DescribeAutoScalingGroups",
          "autoscaling:DescribeAutoScalingInstances",
          "autoscaling:DescribeLaunchConfigurations",
          "autoscaling:DescribeTags",
          "autoscaling:SetDesiredCapacity",
          "autoscaling:TerminateInstanceInAutoScalingGroup",
          "ec2:DescribeLaunchTemplateVersions"
        ]
        Resource = "*"
      }
    ]
  })
}

# Create an instance profile for the node group
resource "aws_iam_instance_profile" "eks_node_group" {
  name = "eks-node-group-profile"
  role = aws_iam_role.eks_node_group_role.name
}

# Add EKS cluster access for nodes
resource "aws_iam_role_policy" "node_cluster_access" {
  name = "eks-node-cluster-access"
  role = aws_iam_role.eks_node_group_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "eks:DescribeCluster",
          "eks:GetClusterConfig"
        ]
        Resource = module.eks.cluster_arn
      }
    ]
  })
}

# Add EC2 permissions for node bootstrap
resource "aws_iam_role_policy" "node_additional_ec2" {
  name = "eks-node-additional-ec2"
  role = aws_iam_role.eks_node_group_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ec2:DescribeInstances",
          "ec2:DescribeRouteTables",
          "ec2:DescribeSecurityGroups",
          "ec2:DescribeSubnets",
          "ec2:DescribeVolumes",
          "ec2:DescribeVolumesModifications",
          "ec2:DescribeVpcs"
        ]
        Resource = "*"
      }
    ]
  })
}

# Add SSM permissions to node group role
resource "aws_iam_role_policy_attachment" "eks_node_ssm" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
  role       = aws_iam_role.eks_node_group_role.name
}