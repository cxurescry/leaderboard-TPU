FROM alpine

RUN apk add --no-cache python3 make gcc musl-dev nodejs npm bash

WORKDIR /app
COPY . .

RUN make
