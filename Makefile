#.PHONY: install up down build rebuild prune remove-recreate recreate u d r rp up-prod recreate-prod
.PHONY: %

PROJECT = greenapi
ENVFILE = .docker/.env
BASELABEL = greenapi

help:
	echo 'help goes here'

up:
	docker-compose -p ${PROJECT} --env-file ${ENVFILE} up -d

up-elk:
	docker-compose -p ${PROJECT} -f docker-compose-elk.yml --env-file ${ENVFILE} up -d

down: 
	docker-compose -p ${PROJECT} -f docker-compose-elk.yml -f docker-compose.yml --env-file ${ENVFILE} down
	
down-v:
	docker-compose -p ${PROJECT} -f docker-compose-elk.yml -f docker-compose.yml --env-file ${ENVFILE} down -v

prune: down
	docker container prune -f --filter="label=${BASELABEL}=true"
	docker image prune -a -f --filter="label=${BASELABEL}=true"

clean: down-v
	docker container prune -f --filter="label=${BASELABEL}=true"
	docker image prune -a -f --filter="label=${BASELABEL}=true"

build:
	docker-compose -p ${PROJECT} -f docker-compose-elk.yml -f docker-compose.yml --env-file ${ENVFILE} build

rebuild: build up

show-config: 
	docker-compose -p ${PROJECT} --env-file ${ENVFILE} config
