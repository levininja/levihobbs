FROM node:20-alpine AS frontend
WORKDIR /src

COPY src/levihobbs/package*.json src/levihobbs/
COPY src/levihobbs/react-apps/book-reviews-app/package*.json src/levihobbs/react-apps/book-reviews-app/

RUN npm --prefix src/levihobbs ci
RUN npm --prefix src/levihobbs/react-apps/book-reviews-app ci

COPY src/levihobbs/ src/levihobbs/

RUN npm --prefix src/levihobbs run build
RUN npm --prefix src/levihobbs/react-apps/book-reviews-app run build

RUN rm -rf src/levihobbs/node_modules src/levihobbs/react-apps/book-reviews-app/node_modules

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY src/levihobbs/levihobbs.csproj src/levihobbs/
COPY src/BookDataApi.Shared/BookDataApi.Shared.csproj src/BookDataApi.Shared/
RUN dotnet restore src/levihobbs/levihobbs.csproj

COPY src/BookDataApi.Shared/ src/BookDataApi.Shared/
COPY --from=frontend /src/src/levihobbs/ src/levihobbs/

RUN dotnet publish src/levihobbs/levihobbs.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends wget && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "levihobbs.dll"]
