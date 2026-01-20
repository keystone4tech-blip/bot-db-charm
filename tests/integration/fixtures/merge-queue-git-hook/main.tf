# Terraform fixture for Git Hook integration tests

variable "repository_name" {
  type    = string
  default = "test-repo"
}

variable "environment" {
  type    = string
  default = "test"
}

variable "enable_git_hooks" {
  type    = bool
  default = true
}

variable "hook_events" {
  type    = list(string)
  default = ["push", "pull_request"]
}

variable "merge_queue_branch" {
  type    = string
  default = "main"
}

locals {
  common_tags = {
    Environment = var.environment
    Service     = "merge-queue-git-hook"
    ManagedBy   = "Terraform"
  }
}

# GitHub webhook integration
resource "github_repository_webhook" "merge_queue_webhook" {
  repository = var.repository_name
  active     = true
  events     = var.hook_events

  configuration {
    url          = aws_api_gateway_deployment.merge_queue_api.deployment_endpoint
    content_type = "json"
    insecure_ssl = false
  }
}

# API Gateway (reused from merge-queue fixture)
resource "aws_api_gateway_rest_api" "merge_queue_api" {
  name        = "merge-queue-git-hook-${var.environment}"
  description = "Git Hook Integration for Merge Queue"

  tags = local.common_tags
}

# Lambda webhook processor
resource "aws_lambda_function" "webhook_processor" {
  filename      = "webhook_processor.zip"
  function_name = "merge-queue-webhook-${var.environment}"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "webhook.handler"
  runtime       = "nodejs18.x"

  environment {
    variables = {
      GITHUB_TOKEN       = "test-token"
      GITHUB_REPOSITORY  = var.repository_name
      MERGE_QUEUE_BRANCH = var.merge_queue_branch
      ENABLE_GIT_HOOKS   = var.enable_git_hooks
    }
  }

  tags = local.common_tags
}

resource "aws_iam_role" "lambda_exec" {
  name = "merge-queue-webhook-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# Outputs
output "webhook_url" {
  value = aws_api_gateway_deployment.merge_queue_api.deployment_endpoint
}

output "lambda_function_name" {
  value = aws_lambda_function.webhook_processor.function_name
}