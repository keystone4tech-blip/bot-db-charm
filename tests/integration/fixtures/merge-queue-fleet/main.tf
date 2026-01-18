# Terraform fixture for Fleet deployment tests

variable "service_name" {
  type    = string
  default = "test-merge-queue-fleet"
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
    Deployment  = "fleet"
    ManagedBy   = "Terraform"
  }
}

# Fleet of Lambda functions for distributed processing
resource "aws_lambda_function" "merge_queue_processor" {
  count = 5  # Fleet size

  function_name = "${var.service_name}-proc-${count.index}-${var.environment}"
  filename      = "lambda_function.zip"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  memory_size   = 512
  timeout       = 30

  environment {
    variables = {
      INSTANCE_ID        = tostring(count.index)
      MAX_QUEUE_SIZE     = var.max_queue_size
      MAX_CONCURRENT_JOBS = var.max_concurrent_jobs
      PROCESSING_INTERVAL = var.processing_interval
      RATE_LIMIT_REQUESTS = var.rate_limit_requests
      RATE_LIMIT_INTERVAL = var.rate_limit_interval
      ENVIRONMENT        = var.environment
    }
  }

  tags = merge(local.common_tags, {
    InstanceID = tostring(count.index)
  })
}

# Application Load Balancer for distributing requests across fleet
resource "aws_lb" "merge_queue_fleet" {
  name               = "${var.service_name}-alb-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets           = aws_subnet.public[*].id

  enable_deletion_protection = false

  tags = local.common_tags
}

resource "aws_lb_target_group" "merge_queue_fleet" {
  name     = "${var.service_name}-tg-${var.environment}"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    enabled             = true
    interval           = 30
    path               = "/health"
    port               = "traffic-port"
    protocol           = "HTTP"
    timeout            = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }

  tags = local.common_tags
}

resource "aws_lb_listener" "merge_queue_fleet" {
  load_balancer_arn = aws_lb.merge_queue_fleet.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.merge_queue_fleet.arn
  }
}

# Auto Scaling Group for Lambda (simulated with multiple functions)
resource "aws_appautoscaling_target" "merge_queue_fleet" {
  count = var.enable_merge_queue ? 1 : 0

  max_capacity       = 10
  min_capacity       = 3
  resource_id        = "function:${aws_lambda_function.merge_queue_processor[0].function_name}"
  scalable_dimension = "lambda:function:ProvisionedConcurrency"
  service_namespace  = "lambda"
}

# Security Groups
resource "aws_security_group" "alb" {
  name_prefix = "${var.service_name}-alb-sg"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = local.common_tags
}

# VPC (simplified for tests)
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"

  tags = local.common_tags
}

resource "aws_subnet" "public" {
  count = 2

  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = "us-west-2${element(["a", "b"], count.index)}"

  map_public_ip_on_launch = true

  tags = local.common_tags
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda_exec" {
  name = "${var.service_name}-fleet-role-${var.environment}"

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

# CloudWatch Dashboard for fleet monitoring
resource "aws_cloudwatch_dashboard" "fleet_dashboard" {
  dashboard_name = "${var.service_name}-fleet-${var.environment}"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/Lambda", "Invocations", "FunctionName", aws_lambda_function.merge_queue_processor[0].function_name],
            ["AWS/Lambda", "Errors", "FunctionName", aws_lambda_function.merge_queue_processor[0].function_name],
            ["AWS/Lambda", "Duration", "FunctionName", aws_lambda_function.merge_queue_processor[0].function_name]
          ]
          period = 300
          stat   = "Sum"
          region = "us-west-2"
          title  = "Fleet Performance"
        }
      }
    ]
  })

  tags = local.common_tags
}

# Outputs
output "fleet_api_url" {
  value = aws_lb.merge_queue_fleet.dns_name
}

output "lambda_function_names" {
  value = aws_lambda_function.merge_queue_processor[*].function_name
}

output "dashboard_url" {
  value = aws_cloudwatch_dashboard.fleet_dashboard.dashboard_arn
}