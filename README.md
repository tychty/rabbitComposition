# rabbitComposition

This project demonstrates how to create two Node.js servers that communicate with each other through RabbitMQ. It uses Docker Compose to set up the entire environment, making it easy to run and test the system.

## Prerequisites

Before running the project, make sure you have the following software installed on your machine:

- Docker
- Docker Compose

## Project Structure

In this project following services used:

* `m1` - producer Node.js service that accepts HTTP requests via fastify and forwards it to RabbitMQ service
* `rabbitmq` - message brocker
* `m2` - consumer Node.js service that consumes messages sent by `m1` and replies back to `m1` with modified data
* `elasticsearch` - service that stores log data. It is used for log centralization between two Node.js services
* `kibana` - service used in pair with `elasticsearch` to view and analyze the logs

## How to Run

1. Clone this repository to your local machine:

```sh
git clone https://github.com/tychty/rabbitComposition.git
cd rabbitComposition
```

2. Ensure that Docker and Docker Compose are installed on your machine.

3. Update `./.docker/.env` and `./.docker/rabbitmq/definitions.json` files to configure project according to your requirements.

4. Run the following command to start the `elasticsearch` and `kibana` containers (you can skip this step if you only want to see the logs in containers STDOUT):
```sh
docker-compose -p greenapi -f docker-compose-elk.yml --env-file .docker/.env up -d
```

Please wait for `elasticsearch` and `kibana` to spin up before going to next step.

You can access `kibana` [here](http://localhost:5601) if you didn't change the `KIBANA_PORT` in `./.docker/.env`, otherwise use the port you have set (`http://localhost:{KIBANA_PORT}`)

5. Run the following command to start the Node.js and RabbitMQ containers
```sh
docker-compose -p greenapi --env-file .docker/.env up -d
```

RabbitMQ Management web interface is available [here](http://localhost:15672) if you didn't change the `AMQP_PORT` in `./.docker/.env`, otherwise use the port you have set (`http://localhost:{AMQP_PORT}`)
```yaml
user: guest
password: guest
```

Node.js `m1` service is available on port `3000`  if you didn't change the `M1_PORT` in `./.docker/.env`, otherwise use the port you have set (`http://localhost:{M1_PORT}`)


6. The `m1` Node.js server is awaiting for your HTTP requests. It will send a message to RabbitMQ when a HTTP request received, and the `m2` Node.js server will receive, process the message and reply to `m1`. `m1` receives the messege and replies back to your HTTP request.

7. To remove the containers run the following command:
```sh
docker-compose -p greenapi -f docker-compose-elk.yml -f docker-compose.yml --env-file .docker/.env down
```

## Logs monitoring (Kibana)

You can access `kibana` [here](http://localhost:5601) if you didn't change the `KIBANA_PORT` in `./.docker/.env`, otherwise use the port you have set (`http://localhost:{KIBANA_PORT}`)

1. To create index pattern
    1. Go to `Menu`(top left corner) -> `Management` -> `Stack Management`
    2. Go to `Kibana` -> `Index patterns` on the left side of the screen
    3. Click on `Create index patterns` button on the right
    4. Name the index (`green-api-logs` is set as `LOG_AGGREGATOR_INDEX` in `./.docker/.env`)
    5. Select timestamp field
    6. Click on `Create index patterns` button on the bottom of the screen
2. When you created index pattern
    1. Go to `Menu`(top left corner) -> `Analytics` -> `Discover`
    2. Select the index pattern
    3. Adjust the filters according to your requirements
    4. Adjust fields according to your requirements (note: `module` stands for service which sent the log)

Note: this instructions are for the first and quick logs monitoring. You can discover more on Kibana to create better analytics.

## Logs monitoring (STDOUT)

1. Run following command and copy `CONTAINER ID` of the service you want to view the logs of
```sh
docker ps
```

2. Run following command:
```sh
docker logs -f {CONTAINER ID}
```

## Another commands available for docker management
* Build project. **If you change any of the the files in any Node.js project you have to build the project again**
```sh
docker-compose -p greenapi -f docker-compose-elk.yml -f docker-compose.yml --env-file .docker/.env build
```

* Remove the containers and the volumes
```sh
docker-compose -p greenapi -f docker-compose-elk.yml -f docker-compose.yml --env-file .docker/.env down -v
```

* Clean project
```sh
docker-compose -p greenapi -f docker-compose-elk.yml -f docker-compose.yml --env-file .docker/.env down -v
docker container prune -f --filter="label=greenapi=true"
docker image prune -a -f --filter="label=greenapi=true"
```

## Important Notes

- The RabbitMQ messages are stored in a Docker volume named `rabbitmqdata`. The ElasticSearch data is stored in a Docker volume named `elasticdata`. This ensures that the data persist even if the containers are stopped or removed. For data safety and backups, consider managing this volume separately.

- In a production environment, consider securing the instances.



###### Link for task: [drive](https://drive.google.com/file/d/17HF59pZHCDlM81sumYA1VroSDTXPJRZk/view?usp=sharing)