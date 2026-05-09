FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY src/book-data-api/book-data-api.csproj src/book-data-api/
COPY src/BookDataApi.Shared/BookDataApi.Shared.csproj src/BookDataApi.Shared/
RUN dotnet restore src/book-data-api/book-data-api.csproj

COPY src/book-data-api/ src/book-data-api/
COPY src/BookDataApi.Shared/ src/BookDataApi.Shared/
RUN dotnet publish src/book-data-api/book-data-api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends wget && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "book-data-api.dll"]
