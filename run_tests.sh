#!/bin/sh

set -eu

# Run tests, which have their own levihobbs.Tests project
dotnet test src/levihobbs.Tests/levihobbs.Tests.csproj "${@}" 