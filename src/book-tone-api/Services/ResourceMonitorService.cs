using BookToneApi.Data;
using BookToneApi.Models;
using System.Diagnostics;
using System.Runtime.InteropServices;

namespace BookToneApi.Services
{
    public class ResourceMonitorService : IResourceMonitorService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<ResourceMonitorService> _logger;
        private readonly Process _currentProcess;
        private readonly PerformanceCounter? _cpuCounter;

        public ResourceMonitorService(
            IServiceProvider serviceProvider,
            ILogger<ResourceMonitorService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _currentProcess = Process.GetCurrentProcess();
            
            // Initialize CPU counter (only works on Windows)
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                try
                {
                    _cpuCounter = new PerformanceCounter("Processor", "% Processor Time", "_Total");
                    _cpuCounter.NextValue(); // First call returns 0, so we call it once
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Could not initialize CPU performance counter");
                    _cpuCounter = null;
                }
            }
        }

        public async Task<ResourceMetrics> GetCurrentMetricsAsync()
        {
            double cpuUsage = 0;
            long memoryUsage = 0;
            long availableMemory = 0;
            double memoryUsagePercent = 0;

            try
            {
                // Get CPU usage
                if (_cpuCounter != null && RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                {
                    cpuUsage = _cpuCounter.NextValue();
                }
                else
                {
                    // Fallback: use process CPU time (less accurate but works cross-platform)
                    cpuUsage = await GetProcessCpuUsageAsync();
                }

                // Get memory usage
                memoryUsage = _currentProcess.WorkingSet64; // Current process memory
                
                // Get available system memory
                if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                {
                    availableMemory = GetAvailableMemoryWindows();
                }
                else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
                {
                    availableMemory = await GetAvailableMemoryLinuxAsync();
                }
                else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
                {
                    availableMemory = await GetAvailableMemoryMacOSAsync();
                }

                // Calculate memory usage percentage
                if (availableMemory > 0)
                {
                    memoryUsagePercent = (double)memoryUsage / (memoryUsage + availableMemory) * 100;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting resource metrics");
            }

            return new ResourceMetrics
            {
                CpuUsagePercent = Math.Round(cpuUsage, 2),
                MemoryUsageBytes = memoryUsage,
                AvailableMemoryBytes = availableMemory,
                MemoryUsagePercent = Math.Round(memoryUsagePercent, 2)
            };
        }

        public async Task LogMetricsAsync(string batchId, int? bookId = null)
        {
            try
            {
                ResourceMetrics metrics = await GetCurrentMetricsAsync();
                metrics.BatchId = batchId;
                metrics.BookId = bookId;

                using IServiceScope scope = _serviceProvider.CreateScope();
                ApplicationDbContext context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                
                context.ResourceMetrics.Add(metrics);
                await context.SaveChangesAsync();

                _logger.LogDebug("Logged resource metrics for batch {BatchId}, book {BookId}: CPU {Cpu}%, Memory {Memory}%", 
                    batchId, bookId ?? 0, metrics.CpuUsagePercent, metrics.MemoryUsagePercent);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to log resource metrics");
            }
        }

        private async Task<double> GetProcessCpuUsageAsync()
        {
            try
            {
                // Get CPU time before and after a small delay
                TimeSpan startCpuTime = _currentProcess.TotalProcessorTime;
                await Task.Delay(100); // Wait 100ms
                TimeSpan endCpuTime = _currentProcess.TotalProcessorTime;
                
                TimeSpan cpuTimeUsed = endCpuTime - startCpuTime;
                double cpuUsagePercent = (cpuTimeUsed.TotalMilliseconds / 100.0) * 100;
                
                return Math.Min(cpuUsagePercent, 100); // Cap at 100%
            }
            catch
            {
                return 0;
            }
        }

        private long GetAvailableMemoryWindows()
        {
            try
            {
                var memoryInfo = new MEMORYSTATUSEX();
                memoryInfo.dwLength = (uint)Marshal.SizeOf(typeof(MEMORYSTATUSEX));
                
                if (GlobalMemoryStatusEx(ref memoryInfo))
                {
                    return (long)memoryInfo.ullAvailPhys;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not get available memory on Windows");
            }
            
            return 0;
        }

        private async Task<long> GetAvailableMemoryLinuxAsync()
        {
            try
            {
                // Read /proc/meminfo
                string[] lines = await File.ReadAllLinesAsync("/proc/meminfo");
                foreach (string line in lines)
                {
                    if (line.StartsWith("MemAvailable:"))
                    {
                        string[] parts = line.Split(':', StringSplitOptions.RemoveEmptyEntries);
                        if (parts.Length == 2)
                        {
                            string value = parts[1].Trim().Split(' ')[0];
                            if (long.TryParse(value, out long kb))
                            {
                                return kb * 1024; // Convert KB to bytes
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not get available memory on Linux");
            }
            
            return 0;
        }

        private async Task<long> GetAvailableMemoryMacOSAsync()
        {
            try
            {
                // Use vm_stat command
                var startInfo = new ProcessStartInfo
                {
                    FileName = "vm_stat",
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    CreateNoWindow = true
                };

                using Process process = Process.Start(startInfo)!;
                string output = await process.StandardOutput.ReadToEndAsync();
                await process.WaitForExitAsync();

                // Parse vm_stat output to get available memory
                // This is a simplified version - you might want to parse more fields
                long pageSize = 4096; // Default page size
                long freePages = 0;

                foreach (string line in output.Split('\n'))
                {
                    if (line.Contains("Pages free:"))
                    {
                        string[] parts = line.Split(':');
                        if (parts.Length == 2 && long.TryParse(parts[1].Trim().Split('.')[0], out long pages))
                        {
                            freePages = pages;
                            break;
                        }
                    }
                }

                return freePages * pageSize;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not get available memory on macOS");
            }
            
            return 0;
        }

        // Windows API for memory status
        [DllImport("kernel32.dll", SetLastError = true)]
        private static extern bool GlobalMemoryStatusEx(ref MEMORYSTATUSEX lpBuffer);

        [StructLayout(LayoutKind.Sequential)]
        private struct MEMORYSTATUSEX
        {
            public uint dwLength;
            public uint dwMemoryLoad;
            public ulong ullTotalPhys;
            public ulong ullAvailPhys;
            public ulong ullTotalPageFile;
            public ulong ullAvailPageFile;
            public ulong ullTotalVirtual;
            public ulong ullAvailVirtual;
            public ulong ullAvailExtendedVirtual;
        }
    }
} 