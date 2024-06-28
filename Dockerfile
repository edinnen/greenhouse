FROM golang:latest AS build

RUN apt-get update -y

RUN apt-get install -y \
  build-essential \
  cmake \
  git \
  curl \
  dnsutils \
  python3 \
  python3-venv \
  libaugeas0 \
  libc6 \
  libc6-amd64-cross

RUN python3 -m venv /opt/certbot
RUN /opt/certbot/bin/pip install --upgrade pip

RUN /opt/certbot/bin/pip install certbot certbot-dns-route53
RUN ln -s /opt/certbot/bin/certbot /bin/certbot

VOLUME /etc/letsencrypt

RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs

RUN mkdir -p /go/src/github.com/edinnen/greenHouse
COPY . /go/src/github.com/edinnen/greenHouse

RUN mkdir -p /var/www/greenhouse && mkdir -p /var/greenhouse
COPY ./frontend /var/greenhouse/
WORKDIR /var/greenhouse
RUN npm install && npm run build
RUN cp -r build/* /var/www/greenhouse

WORKDIR /go/src/github.com/edinnen/greenHouse/cmd

RUN go build -o $GOPATH/bin/greenhouse .

FROM envoyproxy/envoy:v1.30-latest

COPY --from=build /go/bin/greenhouse /usr/local/bin/greenhouse
COPY --from=build /var/www/greenhouse /var/www/greenhouse
RUN mkdir -p /etc/envoy
COPY ./envoy.yaml /etc/envoy/envoy.yaml
RUN chmod 777 /etc/envoy/envoy.yaml

CMD ["greenhouse", "-appPort", "3000"]

