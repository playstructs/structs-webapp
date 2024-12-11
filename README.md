# structs-webapp

The webapp for the front-end, back-end and API for Structs. It's a PHP 8.2 project using the Symfony 6.3 framework with Doctrine. This repo also contains the docker image which the webapp runs on. The docker image is running PHP 8.2 and apache and has Composer and Symfony installed on it. For easy development, the docker container has the /src directory bind mounted to the structs-webapp/src directory meaning the container reads the application files from your local machine and modifications to the files will show up in the container.

## Structs
In the distant future the species of the galaxy are embroiled in a race for Alpha Matter, the rare and dangerous substance that fuels galactic civilization. Players take command of Structs, a race of sentient machines, and must forge alliances, conquer enemies and expand their influence to control Alpha Matter and the fate of the galaxy.

## Setup

### 1. Clone the repository

`git clone https://github.com/playstructs/structs-webapp.git`

### 2. Build the docker image

`docker build -t structs-webapp .`

### 3. Run the container

`docker compose up -d`

To run the full stack (including Structs Consensus Engine), use `docker compose -f docker-compose-full-stack.yml up -d` or `docker compose -f docker-compose-full-stack-arm64.yml up -d` depending on your architecture. 


## Connecting to the container

### 1. Web Browser

`http://localhost:8080/`

### 2. Bash

`docker exec -it structs-webapp-app-1 bash`


## Learn more

- [Structs](https://playstructs.com)
- [Project Wiki](https://watt.wiki)
- [@PlayStructs Twitter](https://twitter.com/playstructs)


## License

Copyright 2021 [Slow Ninja Inc](https://slow.ninja).

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.