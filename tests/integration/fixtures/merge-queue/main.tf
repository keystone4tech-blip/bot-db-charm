# Terraform fixture for MergeQueue integration tests
# Basic infrastructure for testing merge queue functionality

variable "service_name" {
  type    = string
  default = "test-merge-queue"
}

variable "environment" {
  type    = string
  default = "test"
}

variable "enable_merge_queue" {
  type    = bool
  default = true
}

variable "max_queue_size" {
  type    = number
  default = 100
}

variable "max_concurrent_jobs" {
  type    = number
  default = 5
}

variable "processing_interval" {
  type    = number
  default = 30
}

variable "rate_limit_requests" {
  type    = number
  default = 1000
}

variable "rate_limit_interval" {
  type    = number
  default = 3600
}

locals {
  common_tags = {
    Environment = var.environment
    Service     = var.service_name
    ManagedBy   = "Terraform"
  }
}

# API Gateway for merge queue endpoints
resource "aws_api_gateway_rest_api" "merge_queue_api" {
  name        = "${var.service_name}-${var.environment}"
  description = "Merge Queue API for ${var.service_name}"

  tags = local.common_tags
}

resource "aws_api_gateway_resource" "merge_queue" {
  rest_api_id = aws_api_gateway_rest_api.merge_queue_api.id
  parent_id   = aws_api_gateway_rest_api.merge_queue_api.root_resource_id
  path_part   = "merge-queue"
}

resource "aws_api_gateway_resource" "job" {
  rest_api_id = aws_api_gateway_rest_api.merge_queue_api.id
  parent_id   = aws_api_gateway_resource.merge_queue.id
  path_part   = "job"
}

resource "aws_api_gateway_method" "job_post" {
  rest_api_id   = aws_api_gateway_rest_api.merge_queue_api.id
  resource_id   = aws_api_gateway_resource.job.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "job_integration" {
  rest_api_id             = aws_api_gateway_rest_api.merge_queue_api.id
  resource_id             = aws_api_gateway_resource.job.id
  http_method             = aws_api_gateway_method.job_post.http_method
  type                    = "MOCK"
  passthrough_behavior    = "WHEN_NO_MATCH"
  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

resource "aws_api_gateway_method_response" "job_response_200" {
  rest_api_id = aws_api_gateway_rest_api.merge_queue_api.id
  resource_id = aws_api_gateway_resource.job.id
  http_method = aws_api_gateway_method.job_post.http_method
  status_code = "200"
}

resource "aws_api_gateway_method_response" "job_response_429" {
  rest_api_id = aws_api_gateway_rest_api.merge_queue_api.id
  resource_id = aws_api_gateway_resource.job.id
  http_method = aws_api_gateway_method.job_post.http_method
  status_code = "429"
}

resource "aws_api_gateway_integration_response" "job_integration_response_200" {
  rest_api_id = aws_api_gateway_rest_api.merge_queue_api.id
  resource_id = aws_api_gateway_resource.job.id
  http_method = aws_api_gateway_method.job_post.http_method
  status_code = aws_api_gateway_method_response.job_response_200.status_code
  response_templates = {
    "application/json" = jsonencode({
      message        = "Job queued successfully"
      jobId          = "$context.requestId"
      queuePosition  = "1"
      estimatedTime  = "30s"
    })
  }
  depends_on = [aws_api_gateway_method_response.job_response_200]
}

# Lambda function for merge queue processing
resource "aws_lambda_function" "merge_queue_processor" {
  filename         = "lambda_function.zip"
  function_name    = "${var.service_name}-processor-${var.environment}"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "index.handler"
  runtime          = "nodejs18.x"
  memory_size      = 512
  timeout          = 30

  environment {
    variables = {
      MAX_QUEUE_SIZE       = var.max_queue_size
      MAX_CONCURRENT_JOBS  = var.max_concurrent_jobs
      PROCESSING_INTERVAL  = var.processing_interval
      RATE_LIMIT_REQUESTS  = var.rate_limit_requests
      RATE_LIMIT_INTERVAL  = var.rate_limit_interval
      ENVIRONMENT          = var.environment
    }
  }

  tags = local.common_tags
}

resource "aws_iam_role" "lambda_exec" {
  name = "${var.service_name}-lambda-${var.environment}"

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

resource "aws_iam_role_policy_attachment" "lambda_policy" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# CloudWatch Log Group for Lambda
resource "aws_cloudwatch_log_group" "merge_queue_logs" {
  name              = "/aws/lambda/${aws_lambda_function.merge_queue_processor.function_name}"
  retention_in_days = 30

  tags = local.common_tags
}

# DynamoDB table for queue state management
resource "aws_dynamodb_table" "merge_queue_state" {
  name         = "${var.service_name}-queue-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "queueId"

  attribute {
    name = "queueId"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  tags = local.common_tags
}

# CloudWatch Alarm for queue depth
resource "aws_cloudwatch_metric_alarm" "queue_depth_alarm" {
  alarm_name          = "${var.service_name}-queue-depth-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "QueueDepth"
  namespace           = "MergeQueue"
  period              = 300
  statistic           = "Average"
  threshold           = var.max_queue_size * 0.8
  alarm_description   = "Queue depth is above 80% capacity"

  dimensions = {
    Service   = var.service_name
    Environment = var.environment
  }

  alarm_actions = []

  tags = local.common_tags
}

# Outputs
output "api_gateway_url" {
  value = aws_api_gateway_deployment.merge_queue_api.deployment_endpoint
}

output "lambda_function_name" {
  value = aws_lambda_function.merge_queue_processor.function_name
}

output "queue_table_name" {
  value = aws_dynamodb_table.merge_queue_state.name
}

output "cloudwatch_log_group" {
  value = aws_cloudwatch_log_group.merge_queue_logs.name
}

# API Gateway Deployment (placeholder for actual deployment)
resource "aws_api_gateway_deployment" "merge_queue_api" {
  rest_api_id = aws_api_gateway_rest_api.merge_queue_api.id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.merge_queue.id,
      aws_api_gateway_method.job_post.id
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    aws_api_gateway_method.job_post,
    aws_api_gateway_integration.job_integration
  ]
}