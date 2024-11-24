# IAM policy for EKS cluster creation
resource "aws_iam_policy" "eks_cluster_creation" {
  name        = "eks-cluster-creation-policy"
  description = "Policy for creating EKS cluster and related resources"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "kms:CreateKey",
          "kms:TagResource",
          "kms:CreateAlias",
          "kms:DeleteAlias",
          "kms:DescribeKey",
          "kms:UpdateAlias",
          "kms:GetKeyPolicy",
          "kms:PutKeyPolicy",
          "logs:CreateLogGroup",
          "logs:DeleteLogGroup",
          "logs:PutRetentionPolicy",
          "iam:CreateRole",
          "iam:DeleteRole",
          "iam:GetRole",
          "iam:PutRolePolicy",
          "iam:AttachRolePolicy",
          "iam:DetachRolePolicy",
          "iam:DeleteRolePolicy",
          "iam:CreateServiceLinkedRole",
          "iam:ListRoles",
          "iam:ListInstanceProfiles",
          "iam:PassRole", 
          "ec2:DescribeSubnets",
          "ec2:DescribeVpcs",
          "ec2:DescribeSecurityGroups",
          "ec2:DescribeRouteTables",
          "ec2:DescribeInternetGateways",
          "ec2:DescribeNatGateways",
          "ec2:CreateSecurityGroup",
          "ec2:CreateTags",
          "ec2:AuthorizeSecurityGroupIngress",
          "ec2:RevokeSecurityGroupIngress",
          "ec2:CreateFlowLogs",
          "ec2:DeleteFlowLogs",
          "eks:DescribeCluster",
          "eks:CreateCluster",
          "eks:DeleteCluster",
          "eks:DescribeCluster",
          "eks:UpdateClusterVersion",
          "eks:UpdateClusterConfig",
          "eks:ListClusters",
          "eks:TagResource",
          "eks:UntagResource",
          "eks:CreateNodeGroup",
          "eks:DescribeNodegroup",
          "eks:CreateNodegroup",
          "eks:DeleteNodegroup",
          "eks:UpdateNodegroupConfig",
          "eks:UpdateNodegroupVersion",
          "eks:ListNodegroups",
          "eks:AssociateEncryptionConfig",
        ]
        Resource = [
          "arn:aws:eks:*:${data.aws_caller_identity.current.account_id}:nodegroup/*/*/*",
          "arn:aws:eks:*:${data.aws_caller_identity.current.account_id}:cluster/*",
          "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/*",  # Added for IAM role access
          "arn:aws:kms:*:${data.aws_caller_identity.current.account_id}:key/*",  # Added for KMS key access
          "arn:aws:logs:*:${data.aws_caller_identity.current.account_id}:log-group:*"  # Added for CloudWatch Logs access        
        ]
      }
    ]
  })
}

# Attach the policy to the user
resource "aws_iam_user_policy_attachment" "eks_cluster_creation" {
  user       = "secure-auth-project"
  policy_arn = aws_iam_policy.eks_cluster_creation.arn
}