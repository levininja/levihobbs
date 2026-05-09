using BookToneApi.Data;
using BookToneApi.Models;
using BookDataApi.Shared.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Concurrent;

namespace BookToneApi.Services
{
    public class BatchProcessingService : IBatchProcessingService, IHostedService, IDisposable
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<BatchProcessingService> _logger;
        private readonly ConcurrentQueue<BatchJob> _jobQueue = new();
        private readonly ConcurrentDictionary<string, BatchProcessingStatus> _activeJobs = new();
        private readonly SemaphoreSlim _semaphore = new(1, 1); // Only process one job at a time
        private readonly CancellationTokenSource _cancellationTokenSource = new();
        private Task? _processingTask;

        public BatchProcessingService(
            IServiceProvider serviceProvider,
            ILogger<BatchProcessingService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        public async Task<string> StartBatchProcessingAsync(List<int> bookIds)
        {
            string batchId = Guid.NewGuid().ToString("N");
            
            using IServiceScope scope = _serviceProvider.CreateScope();
            ApplicationDbContext context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            
            BatchJob batchJob = new BatchJob
            {
                BatchId = batchId,
                Status = "Queued",
                TotalBooks = bookIds.Count,
                ProcessedBooks = 0,
                FailedBooks = 0,
                CreatedAt = DateTime.UtcNow
            };
            
            context.BatchJobs.Add(batchJob);
            
            // Store the book IDs for this batch
            List<BatchJobDetail> batchJobDetails = bookIds.Select(bookId => new BatchJobDetail
            {
                BatchId = batchId,
                BookId = bookId,
                CreatedAt = DateTime.UtcNow
            }).ToList();
            
            context.BatchJobDetails.AddRange(batchJobDetails);
            await context.SaveChangesAsync();
            
            _jobQueue.Enqueue(batchJob);
            _logger.LogInformation("Queued batch job {BatchId} with {BookCount} books", batchId, bookIds.Count);
            
            return batchId;
        }

        /// <summary>
        /// Gets the status of a batch job using a dual tracking system:
        ///  1. Check in-memory cache first for fast lookups of active jobs (no DB hit)
        ///  2. Fall back to database for completed jobs (persists after job finishes/app restarts)
        /// </summary>
        public async Task<BatchProcessingStatus> GetBatchStatusAsync(string batchId)
        {
            if (_activeJobs.TryGetValue(batchId, out BatchProcessingStatus? status))
                return status;

            // Check database for completed jobs
            using IServiceScope scope = _serviceProvider.CreateScope();
            ApplicationDbContext context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            
            BatchJob? batchJob = await context.BatchJobs
                .FirstOrDefaultAsync(j => j.BatchId == batchId);
            
            if (batchJob == null)
                return new BatchProcessingStatus { Status = "NotFound" };

            return new BatchProcessingStatus
            {
                BatchId = batchJob.BatchId,
                Status = batchJob.Status,
                TotalBooks = batchJob.TotalBooks,
                ProcessedBooks = batchJob.ProcessedBooks,
                FailedBooks = batchJob.FailedBooks,
                StartedAt = batchJob.StartedAt ?? batchJob.CreatedAt,
                CompletedAt = batchJob.CompletedAt,
                ErrorMessage = batchJob.ErrorMessage
            };
        }

        public async Task<List<BatchProcessingLog>> GetBatchLogsAsync(string batchId)
        {
            using IServiceScope scope = _serviceProvider.CreateScope();
            ApplicationDbContext context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            
            return await context.BatchProcessingLogs
                .Where(l => l.BatchId == batchId)
                .OrderBy(l => l.CreatedAt)
                .ToListAsync();
        }

        // Starts a background process on app startup
        public Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Batch processing service starting");
            _processingTask = ProcessJobsAsync(_cancellationTokenSource.Token);
            return Task.CompletedTask;
        }

        public async Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Batch processing service stopping");
            _cancellationTokenSource.Cancel();
            
            if (_processingTask != null)
            {
                // Wait for the processing task to complete, but respect the shutdown timeout
                await Task.WhenAny(_processingTask, Task.Delay(Timeout.Infinite, cancellationToken));
            }
        }

        /// <summary>
        /// Runs once a second, checking if there are jobs in the queue and if so, calling ProcessBatchJobAsync.
        /// </summary>
        /// <returns>A task representing the asynchronous operation.</returns>
        private async Task ProcessJobsAsync(CancellationToken cancellationToken)
        {
            while (!cancellationToken.IsCancellationRequested)
            {
                try
                {
                    if (_jobQueue.TryDequeue(out BatchJob? batchJob))
                        await ProcessBatchJobAsync(batchJob, cancellationToken);
                    else
                        await Task.Delay(1000, cancellationToken); // Wait 1 second before checking again
                }
                catch (OperationCanceledException)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in job processing loop");
                    await Task.Delay(5000, cancellationToken); // Wait 5 seconds before retrying
                }
            }
        }

        /// <summary>
        /// Processes a batch job that is in the queue waiting to be processed.
        /// </summary>
        /// <returns>A task representing the asynchronous operation.</returns>
        private async Task ProcessBatchJobAsync(BatchJob batchJob, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Starting batch job {BatchId} with {BookCount} books", 
                batchJob.BatchId, batchJob.TotalBooks);

            // Update the job status that's internal to this service
            BatchProcessingStatus status = new BatchProcessingStatus
            {
                BatchId = batchJob.BatchId,
                Status = "Processing",
                TotalBooks = batchJob.TotalBooks,
                ProcessedBooks = 0,
                FailedBooks = 0,
                StartedAt = DateTime.UtcNow
            };

            _activeJobs[batchJob.BatchId] = status;

            try
            {
                await _semaphore.WaitAsync(cancellationToken);
                
                using IServiceScope scope = _serviceProvider.CreateScope();
                ApplicationDbContext context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                IRecommenderService recommenderService = scope.ServiceProvider.GetRequiredService<IRecommenderService>();

                // Load the batch job from the database so EF can track it
                BatchJob? dbBatchJob = await context.BatchJobs
                    .FirstOrDefaultAsync(b => b.BatchId == batchJob.BatchId, cancellationToken);
                
                if (dbBatchJob == null)
                {
                    _logger.LogError("Batch job {BatchId} not found in database", batchJob.BatchId);
                    return;
                }

                // Update the job status for the database
                dbBatchJob.Status = "Processing";
                dbBatchJob.StartedAt = DateTime.UtcNow;
                await context.SaveChangesAsync(cancellationToken);

                // Get the list of books to process (you'll need to store this or pass it differently)
                // For now, we'll process a fixed number of books as an example
                List<int> bookIds = await GetBookIdsForBatchAsync(context, batchJob.BatchId);
                
                foreach (int bookId in bookIds)
                {
                    if (cancellationToken.IsCancellationRequested)
                        break;

                    try
                    {
                        // Log resource metrics before processing
                        using (IServiceScope resourceScope = _serviceProvider.CreateScope())
                        {
                            IResourceMonitorService resourceMonitor = resourceScope.ServiceProvider.GetRequiredService<IResourceMonitorService>();
                            await resourceMonitor.LogMetricsAsync(dbBatchJob.BatchId, bookId);
                        }
                        
                        // Process the book tone recommendation generation
                        await ProcessSingleBookAsync(context, recommenderService, dbBatchJob.BatchId, bookId);
                        
                        dbBatchJob.ProcessedBooks++;
                        status.ProcessedBooks++;
                        
                        // Save progress after every book since each can take a long time
                        await context.SaveChangesAsync(cancellationToken);
                        
                        // Log resource metrics after processing
                        using (IServiceScope resourceScope = _serviceProvider.CreateScope())
                        {
                            IResourceMonitorService resourceMonitor = resourceScope.ServiceProvider.GetRequiredService<IResourceMonitorService>();
                            await resourceMonitor.LogMetricsAsync(dbBatchJob.BatchId, bookId);
                        }
                        
                        _logger.LogInformation("Batch {BatchId}: Processed {Processed}/{Total} books", 
                            dbBatchJob.BatchId, dbBatchJob.ProcessedBooks, dbBatchJob.TotalBooks);
                    }
                    catch (Exception ex)
                    {
                        dbBatchJob.FailedBooks++;
                        status.FailedBooks++;
                        
                        _logger.LogError(ex, "Failed to process book {BookId} in batch {BatchId}", 
                            bookId, dbBatchJob.BatchId);
                        
                        await LogErrorAsync(context, dbBatchJob.BatchId, bookId, ex);
                    }
                }
                
                // Update the job status that's internal to this service
                status.Status = "Completed";
                status.CompletedAt = DateTime.UtcNow;

                // Update the job status for the database
                dbBatchJob.Status = "Completed";
                dbBatchJob.CompletedAt = DateTime.UtcNow;

                await context.SaveChangesAsync(cancellationToken);
                
                _logger.LogInformation("Completed batch job {BatchId}: {Processed}/{Total} books processed, {Failed} failed", 
                    dbBatchJob.BatchId, dbBatchJob.ProcessedBooks, dbBatchJob.TotalBooks, dbBatchJob.FailedBooks);
            }
            catch (Exception ex)
            {
                status.Status = "Failed";
                status.ErrorMessage = ex.Message;
                status.CompletedAt = DateTime.UtcNow;
                
                _logger.LogError(ex, "Batch job {BatchId} failed", batchJob.BatchId);
                
                using IServiceScope scope = _serviceProvider.CreateScope();
                ApplicationDbContext context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                
                // Load the batch job from database to update its status
                BatchJob? dbBatchJob = await context.BatchJobs
                    .FirstOrDefaultAsync(b => b.BatchId == batchJob.BatchId);
                
                if (dbBatchJob != null)
                {
                    dbBatchJob.Status = "Failed";
                    dbBatchJob.ErrorMessage = ex.Message;
                    dbBatchJob.CompletedAt = DateTime.UtcNow;
                    await context.SaveChangesAsync();
                }
            }
            finally
            {
                _semaphore.Release();
                _activeJobs.TryRemove(batchJob.BatchId, out _);
            }
        }

        /// <summary>
        /// Processes a single book tone recommendation generation.
        /// </summary>
        /// <returns>A task representing the asynchronous operation.</returns>
        private async Task ProcessSingleBookAsync(
            ApplicationDbContext context, 
            IRecommenderService recommenderService, 
            string batchId, 
            int bookId)
        {
            // Log start
            BatchProcessingLog startLog = new BatchProcessingLog
            {
                BatchId = batchId,
                BookId = bookId,
                Status = "Started",
                Message = "Beginning request to generate tone recommendations",
                CreatedAt = DateTime.UtcNow
            };
            context.BatchProcessingLogs.Add(startLog);

            // Generate book tone recommendations
            List<string> recommendations = await recommenderService.GenerateBookToneRecommendationsAsync(bookId);

            // Log completion
            BatchProcessingLog completionLog = new BatchProcessingLog
            {
                BatchId = batchId,
                BookId = bookId,
                Status = "Completed",
                Message = $"Successfully generated {recommendations.Count} recommendations",
                CreatedAt = DateTime.UtcNow,
                CompletedAt = DateTime.UtcNow
            };
            context.BatchProcessingLogs.Add(completionLog);

            // Save recommendations
            List<BookToneRecommendation> bookRecommendations = recommendations.Select(tone => new BookToneRecommendation
            {
                BookId = bookId,
                Feedback = 0,
                Tone = tone,
                CreatedAt = DateTime.UtcNow
            }).ToList();

            context.BookToneRecommendations.AddRange(bookRecommendations);
        }

        private Task LogErrorAsync(ApplicationDbContext context, string batchId, int bookId, Exception ex)
        {
            ErrorLog errorLog = new ErrorLog
            {
                Source = "BatchProcessing",
                ErrorType = ex.GetType().Name,
                ErrorMessage = ex.Message,
                StackTrace = ex.StackTrace,
                BookId = bookId,
                CreatedAt = DateTime.UtcNow
            };
            context.ErrorLogs.Add(errorLog);
            return Task.CompletedTask;
        }

        private async Task<List<int>> GetBookIdsForBatchAsync(ApplicationDbContext context, string batchId)
        {
            return await context.BatchJobDetails
                .Where(d => d.BatchId == batchId)
                .Select(d => d.BookId)
                .ToListAsync();
        }

        public void Dispose()
        {
            _cancellationTokenSource?.Dispose();
            _semaphore?.Dispose();
        }
    }
} 