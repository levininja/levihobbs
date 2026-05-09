FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY src/book-tone-api/BookToneApi.csproj src/book-tone-api/
COPY src/BookDataApi.Shared/BookDataApi.Shared.csproj src/BookDataApi.Shared/
RUN dotnet restore src/book-tone-api/BookToneApi.csproj

COPY src/book-tone-api/ src/book-tone-api/
COPY src/BookDataApi.Shared/ src/BookDataApi.Shared/
RUN dotnet publish src/book-tone-api/BookToneApi.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends wget && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "BookToneApi.dll"]
