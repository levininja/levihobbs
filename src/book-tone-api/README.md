# BookTone API

AI-powered book tone recommendations using Ollama and Phi model. Process individual books or batches with real-time progress tracking.

## Quick Start

1. **Install dependencies:**
   ```bash
   dotnet restore
   dotnet ef database update
   ```

2. **Start Ollama:**
   ```bash
   ollama pull phi
   ollama serve
   ```

3. **Run the API:**
   ```bash
   dotnet run
   ```

API available at `http://localhost:5010`

## Prerequisites

- .NET 8.0 SDK
- PostgreSQL
- Ollama

## API Endpoints

### Individual Book Processing

- `GET /api/BookToneRecommendations/{id}` - Get recommendations for a book - returns list of objects with recommendationId, bookId, tone
- `PUT /api/BookToneRecommendations/{id}` - Update with feedback (pass feedback integer: -1, 0, or 1)

### Batch Processing

Process a handful of books asynchronously with real-time progress tracking.

- `POST /api/BookToneRecommendations?bookIds=1&bookIds=2&bookIds=3` - Start batch job - returns batchId
- `GET /api/BookToneRecommendations/batch/{batchId}/status` - Check progress ("Queued", "Processing", "Completed", "Failed") - returns totalBooks, processedBooks, failedBooks
- `GET /api/BookToneRecommendations/batch/{batchId}/logs` - Get detailed logs
- `GET /api/BookToneRecommendations/batch/{batchId}/metrics` - Get resource usage

### Batch Processing Features

- **Fire-and-Forget**: Start a job and get a batch ID immediately
- **Progress Tracking**: Monitor real-time progress
- **Error Handling**: Individual book failures don't stop the entire batch



### Example Usage

**Start batch job:**
```bash
curl -X POST "http://localhost:5010/api/BookToneRecommendations?bookIds=1&bookIds=2&bookIds=3"
```

**Check progress:**
```bash
curl -X GET "http://localhost:5010/api/BookToneRecommendations/batch/{batchId}/status"
```



## Swagger Documentation

Access the API documentation at: `http://localhost:5010/swagger`

## License

MIT License

Copyright (c) 2025 Levi Hobbs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. 