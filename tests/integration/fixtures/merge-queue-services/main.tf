# Terraform fixture for service integration tests

variable "service_name" {
  type    = string
  default = "test-merge-queue-integration"
}

variable "environment" {
  type    = string
  default = "test"
}

variable "enable_merge_queue" {
  type    = bool
  default = true
}

variable "integration_test_mode" {
  type    = bool
  default = true
}

variable "enable_notification_service" {
  type    = bool
  default = true
}

variable "enable_monitoring_service" {
  type    = bool
  default = true
}

variable "notification_webhook_url" {
  type    = string
  default = ""
}

variable "monitoring_interval" {
  type    = number
  default = 60
}

variable "enable_ci_integration" {
  type    = bool
  default = true
}

variable "ci_pipeline_name" {
  type    = string
  default = "test-pipeline"
}

locals {
  common_tags = {
    Environment           = var.environment
    Service               = var.service_name
    TestMode              = var.integration_test_mode
    ManagedBy             = "Terraform"
  }
}

# Main Lambda Function
resource "aws_lambda_function" "main" {
  filename      = "main_service.zip"
  function_name = "${var.service_name}-main-${var.environment}"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "main.handler"
  runtime       = "nodejs18.x"
  memory_size   = 512
  timeout       = 30

  environment {
    variables = {
      ENVIRONMENT                = var.environment
      ENABLE_CI_INTEGRATION      = var.enable_ci_integration
      CI_PIPELINE_NAME           = var.ci_pipeline_name
      ENABLE_NOTIFICATIONS       = var.enable_notification_service
      NOTIFICATION_WEBHOOK_URL   = var.notification_webhook_url
      ENABLE_MONITORING          = var.enable_monitoring_service
      MONITORING_INTERVAL        = var.monitoring_interval
      INTEGRATION_TEST_MODE      = var.integration_test_mode
    }
  }

  tags = local.common_tags
}

# Notification Service Lambda
resource "aws_lambda_function" "notification_service" {
  count = var.enable_notification_service ? 1 : 0

  filename      = "notification_service.zip"
  function_name = "${var.service_name}-notifications-${var.environment}"
  role          = aws_iam_role.notification_exec.arn
  handler       = "notifications.handler"
  runtime       = "nodejs18.x"

  environment {
    variables = {
      WEBHOOK_URL = var.notification_webhook_url
      SERVICE_NAME = var.service_name
    }
  }

  tags = local.common_tags
}

# Monitoring Service Lambda
resource "aws_lambda_function" "monitoring_service" {
  count = var.enable_monitoring_service ? 1 : 0

  filename      = "monitoring_service.zip"
  function_name = "${var.service_name}-monitoring-${var.environment}"
  role          = aws_iam_role.monitoring_exec.arn
  handler       = "monitoring.handler"
  runtime       = "nodejs18.x"

  environment {
    variables = {
      METRIC_NAMESPACE = "MergeQueue/${var.service_name}"
      MONITORING_INTERVAL = var.monitoring_interval
    }
  }

  tags = local.common_tags
}

# IAM Roles
resource "aws_iam_role" "lambda_exec" {
  name = "${var.service_name}-role-${var.environment}"

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

  tags = local.common_tags
}

resource "aws_iam_role" "notification_exec" {
  name = "${var.service_name}-notif-role-${var.environment}"

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

  tags = local.common_tags
}

resource "aws_iam_role" "monitoring_exec" {
  name = "${var.service_name}-monitor-role-${var.environment}"

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

  tags = local.common_tags
}

# IAM Policy for CloudWatch access
resource "aws_iam_policy" "cloudwatch_access" {
  name        = "${var.service_name}-cloudwatch-${var.environment}"
  description = "CloudWatch access for monitoring"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = [
          "cloudwatch:PutMetricData",
          "cloudwatch:GetMetricData",
          "cloudwatch:ListMetrics"
        ]
        Resource = "*"
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "monitoring_cloudwatch" {
  count      = var.enable_monitoring_service ? 1 : 0
  role       = aws_iam_role.monitoring_exec.name
  policy_arn = aws_iam_policy.cloudwatch_access.arn
}

# EventBridge Rule for scheduling monitoring
resource "aws_cloudwatch_event_rule" "monitoring_schedule" {
  count = var.enable_monitoring_service ? 1 : 0

  name                = "${var.service_name}-monitoring-${var.environment}"
  description         = "Schedule for monitoring service"
  schedule_expression = "rate(${var.monitoring_interval} minutes)"
  is_enabled          = true

  tags = local.common_tags
}

resource "aws_cloudwatch_event_target" "monitoring_target" {
  count = var.enable_monitoring_service ? 1 : 0

  rule      = aws_cloudwatch_event_rule.monitoring_schedule[0].name
  target_id = "${var.service_name}-monitoring"
  arn       = aws_lambda_function.monitoring_service[0].arn
}

# API Gateway for API endpoints
resource "aws_api_gateway_rest_api" "main_api" {
  name        = "${var.service_name}-api-${var.environment}"
  description = "Main API for ${var.service_name}"

  tags = local.common_tags
}

# API Gateway Resources
resource "aws_api_gateway_resource" "status" {
  rest_api_id = aws_api_gateway_rest_api.main_api.id
  parent_id   = aws_api_gateway_rest_api.main_api.root_resource_id
  path_part   = "status"
}

resource "aws_api_gateway_method" "status_get" {
  rest_api_id   = aws_api_gateway_rest_api.main_api.id
  resource_id   = aws_api_gateway_resource.status.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "status_integration" {
  rest_api_id             = aws_api_gateway_rest_api.main_api.id
  resource_id             = aws_api_gateway_resource.status.id
  http_method             = aws_api_gateway_method.status_get.http_method
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.main.invoke_arn
  integration_http_method = "POST"
}

# Lambda Permissions for API Gateway
resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.main.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main_api.execution_arn}/*/*"
}

# SNS Topic for notifications
resource "aws_sns_topic" "notifications" {
  count = var.enable_notification_service ? 1 : 0

  name = "${var.service_name}-notifications-${var.environment}"

  tags = local.common_tags
}

# CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "service_dashboard" {
  dashboard_name = "${var.service_name}-${var.environment}"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 24
        height = 6
        properties = {
          metrics = [
            ["AWS/Lambda", "Invocations", "FunctionName", aws_lambda_function.main.function_name],
            ["AWS/Lambda", "Errors", "FunctionName", aws_lambda_function.main.function_name],
            ["AWS/Lambda", "Duration", "FunctionName", aws_lambda_function.main.function_name]
          ]
          period = 300
          stat   = "Sum"
          region = "us-west-2"
          title  = "Service Performance"
        }
      }
    ]
  })

  tags = local.common_tags
}

# Outputs
output "api_gateway_url" {
  value = aws_api_gateway_rest_api.main_api.execution_arn
}

output "notification_service_url" {
  value = var.enable_notification_service ? aws_lambda_function.notification_service[0].function_name : "disabled"
}

output "monitoring_service_url" {
  value = var.enable_monitoring_service ? aws_lambda_function.monitoring_service[0].function_name : "disabled"
}

output "sns_topic_arn" {
  value = var.enable_notification_service ? aws_sns_topic.notifications[0].arn : "disabled"
}