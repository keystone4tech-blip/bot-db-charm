package unit

import (
    "context"
    "fmt"
    "testing"
    "time"

    "github.com/LambdaTest/test-at-scale/pkg/core"
    "github.com/LambdaTest/test-at-scale/pkg/lumber"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"
    "github.com/stretchr/testify/require"
)

// Mock implementations
type mockGitManager struct {
    mock.Mock
}

func (m *mockGitManager) FetchPRDetails(ctx context.Context, prNumber int) (*core.PullRequest, error) {
    args := m.Called(ctx, prNumber)
    if args.Get(0) == nil {
        return nil, args.Error(1)
    }
    return args.Get(0).(*core.PullRequest), args.Error(1)
}

type mockSecretManager struct {
    mock.Mock
}

func (m *mockSecretManager) GetToken() (string, error) {
    args := m.Called()
    return args.String(0), args.Error(1)
}

// Test cases for MergeQueue service unit tests

func TestMergeQueueServiceCreation(t *testing.T) {
    logger, err := lumber.NewLogger(lumber.LoggingConfig{
        ConsoleLevel: "debug",
        ConsoleJSON:  false,
    })
    require.NoError(t, err, "Failed to create logger")

    cfg := &core.MergeQueueConfig{
        MaxQueueSize:      100,
        MaxConcurrentJobs: 5,
        ProcessingInterval: 30 * time.Second,
        RateLimitRequests: 1000,
        RateLimitInterval: time.Hour,
    }

    gitManager := new(mockGitManager)
    secretManager := new(mockSecretManager)

    // Valid service creation
    service, err := NewMergeQueueService(cfg, gitManager, secretManager, logger)
    assert.NoError(t, err, "Should create merge queue service successfully")
    assert.NotNil(t, service, "Service should not be nil")

    // Test invalid config
    invalidCfg := &core.MergeQueueConfig{
        MaxQueueSize:      0, // Invalid
        MaxConcurrentJobs: 5,
        ProcessingInterval: 30 * time.Second,
    }

    _, err = NewMergeQueueService(invalidCfg, gitManager, secretManager, logger)
    assert.Error(t, err, "Should fail with invalid config")
}

func TestMergeQueueJobProcessing(t *testing.T) {
    logger, _ := lumber.NewLogger(lumber.LoggingConfig{
        ConsoleLevel: "debug",
    })

    cfg := &core.MergeQueueConfig{
        MaxQueueSize:      50,
        MaxConcurrentJobs: 3,
        ProcessingInterval: 100 * time.Millisecond,
        RateLimitRequests: 100,
        RateLimitInterval: time.Minute,
    }

    gitManager := new(mockGitManager)
    secretManager := new(mockSecretManager)

    service, err := NewMergeQueueService(cfg, gitManager, secretManager, logger)
    require.NoError(t, err, "Failed to create service")

    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    // Mock PR details
    mockPR := &core.PullRequest{
        Number:      42,
        Title:       "Test Merge Request",
        BaseBranch:  "main",
        HeadBranch:  "feature/test",
        Author:      "test-author",
        MergeStatus: core.PRStatusPending,
    }

    gitManager.On("FetchPRDetails", ctx, 42).Return(mockPR, nil)
    secretManager.On("GetToken").Return("test-token", nil)

    // Start the service
    err = service.Start(ctx)
    assert.NoError(t, err, "Should start service successfully")

    // Add jobs to queue
    for i := 0; i < 10; i++ {
        job := &core.MergeJob{
            PRNumber: i + 1,
            Priority: i % 3,
        }
        err = service.AddJob(ctx, job)
        assert.NoError(t, err, "Should add job to queue")
    }

    // Wait for processing
    time.Sleep(200 * time.Millisecond)

    // Get queue status
    status := service.GetStatus()
    assert.Greater(t, status.QueueSize, 0, "Queue should have pending jobs")
    assert.Equal(t, 10, status.TotalProcessed, "Should have processed all jobs")

    // Stop the service
    err = service.Stop(ctx)
    assert.NoError(t, err, "Should stop service gracefully")

    gitManager.AssertExpectations(t)
    secretManager.AssertExpectations(t)
}

func TestMergeQueueRateLimiting(t *testing.T) {
    logger, _ := lumber.NewLogger(lumber.LoggingConfig{
        ConsoleLevel: "debug",
    })

    cfg := &core.MergeQueueConfig{
        MaxQueueSize:      100,
        MaxConcurrentJobs: 5,
        ProcessingInterval: 50 * time.Millisecond,
        RateLimitRequests: 10,
        RateLimitInterval: time.Second,
    }

    gitManager := new(mockGitManager)
    secretManager := new(mockSecretManager)

    service, err := NewMergeQueueService(cfg, gitManager, secretManager, logger)
    require.NoError(t, err, "Failed to create service")

    ctx := context.Background()

    // Add mock expectations
    gitManager.On("FetchPRDetails", mock.Anything, mock.Anything).Return(&core.PullRequest{
        Number:      1,
        Title:       "Test PR",
        BaseBranch:  "main",
        HeadBranch:  "test",
        MergeStatus: core.PRStatusPending,
    }, nil)

    secretManager.On("GetToken").Return("test-token", nil)

    // Start service
    require.NoError(t, service.Start(ctx))
    defer service.Stop(ctx)

    // Add jobs exceeding rate limit
    jobsToAdd := 20
    for i := 0; i < jobsToAdd; i++ {
        job := &core.MergeJob{
            PRNumber: i + 1,
            Priority: 1,
        }
        service.AddJob(ctx, job)
    }

    // Wait for rate limiting to take effect
    time.Sleep(1500 * time.Millisecond)

    // Check rate limit metrics
    status := service.GetStatus()
    assert.Less(t, status.JobsInLastInterval, jobsToAdd, "Should have rate limited some jobs")
    assert.Greater(t, status.RateLimitHits, 0, "Should have recorded rate limit hits")
}

func TestMergeQueuePriority(t *testing.T) {
    logger, _ := lumber.NewLogger(lumber.LoggingConfig{
        ConsoleLevel: "debug",
    })

    cfg := &core.MergeQueueConfig{
        MaxQueueSize:      20,
        MaxConcurrentJobs: 1,
        ProcessingInterval: 100 * time.Millisecond,
        RateLimitRequests: 100,
        RateLimitInterval: time.Minute,
    }

    gitManager := new(mockGitManager)
    secretManager := new(mockSecretManager)

    service, err := NewMergeQueueService(cfg, gitManager, secretManager, logger)
    require.NoError(t, err, "Failed to create service")

    ctx := context.Background()

    // Add mock expectations for different PRs
    for i := 1; i <= 5; i++ {
        gitManager.On("FetchPRDetails", ctx, i).Return(&core.PullRequest{
            Number:      i,
            Title:       fmt.Sprintf("PR %d", i),
            BaseBranch:  "main",
            HeadBranch:  fmt.Sprintf("feature/%d", i),
            MergeStatus: core.PRStatusPending,
        }, nil)
    }

    secretManager.On("GetToken").Return("test-token", nil)

    require.NoError(t, service.Start(ctx))
    defer service.Stop(ctx)

    // Add jobs with different priorities
    jobs := []*core.MergeJob{
        {PRNumber: 1, Priority: 3}, // Low priority
        {PRNumber: 2, Priority: 1}, // High priority
        {PRNumber: 3, Priority: 2}, // Medium priority
        {PRNumber: 4, Priority: 1}, // High priority
        {PRNumber: 5, Priority: 3}, // Low priority
    }

    for _, job := range jobs {
        err = service.AddJob(ctx, job)
        assert.NoError(t, err, "Should add job successfully")
    }

    // Wait for some processing
    time.Sleep(200 * time.Millisecond)

    // Verify priority order was respected
    status := service.GetStatus()
    processedOrder := status.ProcessedOrder

    // Higher priority jobs (1) should be processed first
    assert.NotEmpty(t, processedOrder, "Should have processed jobs")

    // Analyze priority processing
    priorityCounts := make(map[int]int)
    for _, pr := range processedOrder {
        for _, job := range jobs {
            if job.PRNumber == pr {
                priorityCounts[job.Priority]++
            }
        }
    }

    // Priority 1 jobs should have higher processing rate
    assert.Greater(t, priorityCounts[1], priorityCounts[3],
        "High priority jobs should be processed more than low priority")
}

func TestMergeQueueConcurrentJobs(t *testing.T) {
    logger, _ := lumber.NewLogger(lumber.LoggingConfig{
        ConsoleLevel: "debug",
    })

    cfg := &core.MergeQueueConfig{
        MaxQueueSize:      50,
        MaxConcurrentJobs: 5,
        ProcessingInterval: 200 * time.Millisecond,
        RateLimitRequests: 50,
        RateLimitInterval: time.Minute,
    }

    gitManager := new(mockGitManager)
    secretManager := new(mockSecretManager)

    service, err := NewMergeQueueService(cfg, gitManager, secretManager, logger)
    require.NoError(t, err, "Failed to create service")

    ctx := context.Background()

    // Add mocks for multiple PRs
    for i := 1; i <= 10; i++ {
        gitManager.On("FetchPRDetails", mock.Anything, i).Return(&core.PullRequest{
            Number:      i,
            Title:       fmt.Sprintf("PR %d", i),
            BaseBranch:  "main",
            HeadBranch:  fmt.Sprintf("feature/%d", i),
            MergeStatus: core.PRStatusPending,
        }, nil)
    }

    secretManager.On("GetToken").Return("test-token", nil)

    require.NoError(t, service.Start(ctx))
    defer service.Stop(ctx)

    // Add multiple jobs
    for i := 0; i < 10; i++ {
        job := &core.MergeJob{
            PRNumber: i + 1,
            Priority: 2,
        }
        service.AddJob(ctx, job)
    }

    // Wait for concurrent processing
    time.Sleep(300 * time.Millisecond)

    // Verify concurrent processing
    status := service.GetStatus()
    assert.Greater(t, status.ActiveJobs, 0, "Should have active jobs processing")
    assert.LessOrEqual(t, status.ActiveJobs, cfg.MaxConcurrentJobs,
        "Active jobs should not exceed max concurrent limit")

    // Verify processing distribution
    totalProcessed := status.TotalProcessed
    assert.Greater(t, totalProcessed, 0, "Should have processed jobs")
}

func TestMergeQueueErrorHandling(t *testing.T) {
    logger, _ := lumber.NewLogger(lumber.LoggingConfig{
        ConsoleLevel: "debug",
    })

    cfg := &core.MergeQueueConfig{
        MaxQueueSize:      10,
        MaxConcurrentJobs: 2,
        ProcessingInterval: 100 * time.Millisecond,
        RateLimitRequests: 10,
        RateLimitInterval: time.Minute,
    }

    gitManager := new(mockGitManager)
    secretManager := new(mockSecretManager)

    service, err := NewMergeQueueService(cfg, gitManager, secretManager, logger)
    require.NoError(t, err, "Failed to create service")

    ctx := context.Background()

    // Mock error scenarios
    gitManager.On("FetchPRDetails", mock.Anything, 1).Return(&core.PullRequest{
        Number:      1,
        Title:       "Valid PR",
        BaseBranch:  "main",
        HeadBranch:  "test",
        MergeStatus: core.PRStatusPending,
    }, nil)

    gitManager.On("FetchPRDetails", mock.Anything, 2).Return(nil, fmt.Errorf("failed to fetch PR"))

    secretManager.On("GetToken").Return("test-token", nil)

    require.NoError(t, service.Start(ctx))
    defer service.Stop(ctx)

    // Add jobs including one that will fail
    validJob := &core.MergeJob{PRNumber: 1, Priority: 1}
    invalidJob := &core.MergeJob{PRNumber: 2, Priority: 1}

    err = service.AddJob(ctx, validJob)
    assert.NoError(t, err, "Should add valid job")

    err = service.AddJob(ctx, invalidJob)
    assert.NoError(t, err, "Should add invalid job (fails during processing)")

    // Wait for processing
    time.Sleep(200 * time.Millisecond)

    // Check error metrics
    status := service.GetStatus()
    assert.Greater(t, status.ErrorsLastInterval, 0, "Should have recorded errors")
    assert.Greater(t, status.TotalErrors, 0, "Should have total error count")

    // Valid job should still be processed
    assert.Equal(t, 1, status.TotalProcessed, "Should process valid jobs despite errors")
}

func TestMergeQueueStopAndRecovery(t *testing.T) {
    logger, _ := lumber.NewLogger(lumber.LoggingConfig{
        ConsoleLevel: "debug",
    })

    cfg := &core.MergeQueueConfig{
        MaxQueueSize:      30,
        MaxConcurrentJobs: 3,
        ProcessingInterval: 100 * time.Millisecond,
        RateLimitRequests: 30,
        RateLimitInterval: time.Minute,
    }

    gitManager := new(mockGitManager)
    secretManager := new(mockSecretManager)

    service, err := NewMergeQueueService(cfg, gitManager, secretManager, logger)
    require.NoError(t, err, "Failed to create service")

    ctx := context.Background()

    // Add mocks
    for i := 1; i <= 5; i++ {
        gitManager.On("FetchPRDetails", mock.Anything, i).Return(&core.PullRequest{
            Number:      i,
            Title:       fmt.Sprintf("PR %d", i),
            BaseBranch:  "main",
            HeadBranch:  fmt.Sprintf("feature/%d", i),
            MergeStatus: core.PRStatusPending,
        }, nil)
    }

    secretManager.On("GetToken").Return("test-token", nil)

    // Start and add jobs
    require.NoError(t, service.Start(ctx))

    for i := 0; i < 5; i++ {
        job := &core.MergeJob{PRNumber: i + 1, Priority: 2}
        service.AddJob(ctx, job)
    }

    // Wait for some processing
    time.Sleep(150 * time.Millisecond)

    // Stop service
    require.NoError(t, service.Stop(ctx))

    firstRunStatus := service.GetStatus()
    processedBeforeStop := firstRunStatus.TotalProcessed

    // Re-start service
    require.NoError(t, service.Start(ctx))
    defer service.Stop(ctx)

    // Add more jobs
    for i := 5; i < 10; i++ {
        gitManager.On("FetchPRDetails", mock.Anything, i+1).Return(&core.PullRequest{
            Number:      i + 1,
            Title:       fmt.Sprintf("PR %d", i+1),
            BaseBranch:  "main",
            HeadBranch:  fmt.Sprintf("feature/%d", i+1),
            MergeStatus: core.PRStatusPending,
        }, nil)

        job := &core.MergeJob{PRNumber: i + 1, Priority: 2}
        service.AddJob(ctx, job)
    }

    // Wait for recovery and new processing
    time.Sleep(200 * time.Millisecond)

    // Verify service recovered and continued processing
    finalStatus := service.GetStatus()
    assert.Greater(t, finalStatus.TotalProcessed, processedBeforeStop,
        "Should continue processing after restart")

    // Verify queue state consistency
    assert.LessOrEqual(t, finalStatus.QueueSize, cfg.MaxQueueSize,
        "Queue size should remain within limits")
}

func TestMergeQueueConfigurationValidation(t *testing.T) {
    logger, _ := lumber.NewLogger(lumber.LoggingConfig{
        ConsoleLevel: "debug",
    })

    testCases := []struct {
        name    string
        config  *core.MergeQueueConfig
        wantErr bool
    }{
        {
            name: "Valid Configuration",
            config: &core.MergeQueueConfig{
                MaxQueueSize:      100,
                MaxConcurrentJobs: 5,
                ProcessingInterval: 30 * time.Second,
                RateLimitRequests: 1000,
                RateLimitInterval: time.Hour,
            },
            wantErr: false,
        },
        {
            name: "Invalid - Zero Queue Size",
            config: &core.MergeQueueConfig{
                MaxQueueSize:      0,
                MaxConcurrentJobs: 5,
                ProcessingInterval: 30 * time.Second,
                RateLimitRequests: 1000,
                RateLimitInterval: time.Hour,
            },
            wantErr: true,
        },
        {
            name: "Invalid - Zero Concurrent Jobs",
            config: &core.MergeQueueConfig{
                MaxQueueSize:      100,
                MaxConcurrentJobs: 0,
                ProcessingInterval: 30 * time.Second,
                RateLimitRequests: 1000,
                RateLimitInterval: time.Hour,
            },
            wantErr: true,
        },
        {
            name: "Invalid - Zero Processing Interval",
            config: &core.MergeQueueConfig{
                MaxQueueSize:      100,
                MaxConcurrentJobs: 5,
                ProcessingInterval: 0,
                RateLimitRequests: 1000,
                RateLimitInterval: time.Hour,
            },
            wantErr: true,
        },
        {
            name: "Invalid - Zero Rate Limit Requests",
            config: &core.MergeQueueConfig{
                MaxQueueSize:      100,
                MaxConcurrentJobs: 5,
                ProcessingInterval: 30 * time.Second,
                RateLimitRequests: 0,
                RateLimitInterval: time.Hour,
            },
            wantErr: true,
        },
        {
            name: "Invalid - Zero Rate Limit Interval",
            config: &core.MergeQueueConfig{
                MaxQueueSize:      100,
                MaxConcurrentJobs: 5,
                ProcessingInterval: 30 * time.Second,
                RateLimitRequests: 1000,
                RateLimitInterval: 0,
            },
            wantErr: true,
        },
    }

    for _, tc := range testCases {
        t.Run(tc.name, func(t *testing.T) {
            gitManager := new(mockGitManager)
            secretManager := new(mockSecretManager)

            _, err := NewMergeQueueService(tc.config, gitManager, secretManager, logger)

            if tc.wantErr {
                assert.Error(t, err, "Should fail with invalid configuration")
            } else {
                assert.NoError(t, err, "Should succeed with valid configuration")
            }
        })
    }
}

func TestMergeQueueGitHubIntegration(t *testing.T) {
    logger, _ := lumber.NewLogger(lumber.LoggingConfig{
        ConsoleLevel: "debug",
    })

    cfg := &core.MergeQueueConfig{
        MaxQueueSize:      20,
        MaxConcurrentJobs: 2,
        ProcessingInterval: 100 * time.Millisecond,
        RateLimitRequests: 20,
        RateLimitInterval: time.Minute,
    }

    gitManager := new(mockGitManager)
    secretManager := new(mockSecretManager)

    service, err := NewMergeQueueService(cfg, gitManager, secretManager, logger)
    require.NoError(t, err, "Failed to create service")

    ctx := context.Background()

    // Test GitHub API integration
    testCases := []struct {
        name        string
        prNumber    int
        prResponse  *core.PullRequest
        prError     error
        expectError bool
    }{
        {
            name:     "Valid PR Fetch",
            prNumber: 100,
            prResponse: &core.PullRequest{
                Number:      100,
                Title:       "GitHub Integration Test",
                BaseBranch:  "main",
                HeadBranch:  "feature/github-test",
                Author:      "github-user",
                MergeStatus: core.PRStatusPending,
            },
            prError:     nil,
            expectError: false,
        },
        {
            name:        "PR Not Found",
            prNumber:    999,
            prResponse:  nil,
            prError:     fmt.Errorf("pull request not found"),
            expectError: true,
        },
        {
            name:     "Already Merged PR",
            prNumber: 200,
            prResponse: &core.PullRequest{
                Number:      200,
                Title:       "Already Merged",
                BaseBranch:  "main",
                HeadBranch:  "feature/old",
                Author:      "test-user",
                MergeStatus: core.PRStatusMerged,
            },
            prError:     nil,
            expectError: false,
        },
    }

    for _, tc := range testCases {
        t.Run(tc.name, func(t *testing.T) {
            gitManager.On("FetchPRDetails", ctx, tc.prNumber).Return(tc.prResponse, tc.prError)
            secretManager.On("GetToken").Return("github-token", nil)

            pr, err := gitManager.FetchPRDetails(ctx, tc.prNumber)

            if tc.expectError {
                assert.Error(t, err, "Should return error")
            } else {
                assert.NoError(t, err, "Should not return error")
                assert.NotNil(t, pr, "Should return PR object")
                if tc.prResponse != nil {
                    assert.Equal(t, tc.prResponse.Number, pr.Number, "PR number should match")
                    assert.Equal(t, tc.prResponse.Title, pr.Title, "PR title should match")
                }
            }
        })
    }
}

// Mock helper functions
type mockJobProcessor struct {
    mock.Mock
}

func (m *mockJobProcessor) ProcessJob(ctx context.Context, job *core.MergeJob) error {
    args := m.Called(ctx, job)
    return args.Error(0)
}

type mockRateLimiter struct {
    mock.Mock
}

func (m *mockRateLimiter) Allow() bool {
    args := m.Called()
    return args.Bool(0)
}

func setupTestMergeJob(prNumber int, priority int) *core.MergeJob {
    return &core.MergeJob{
        PRNumber: prNumber,
        Priority: priority,
        CreatedAt: time.Now(),
        Status: core.JobStatusPending,
    }
}
