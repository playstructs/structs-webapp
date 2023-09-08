# structs-webapp

The webapp for the front-end, back-end and API for Structs. It's a PHP 8.2 project using the Symfony 6.3 framework with Doctrine. This repo also contains the docker image which the webapp runs on. The docker image is running PHP 8.2 and apache and has Composer and Symfony installed on it. For easy development, the docker container has the /src directory bind mounted to the structs-webapp/src directory meaning the container reads the application files from your local machine and modifications to the files will show up in the container.


## Setup

### 1. Clone the repository

`git clone https://github.com/playstructs/structs-webapp.git`

### 2. Build the docker image

`docker build -t structs-webapp .`

### 3. Run the container

`docker compose up -d`


## Connecting to the container

### 1. Web Browser

`http://localhost:8080/`

### 2. Bash

`docker exec -it structs-webapp-app-1 bash`

