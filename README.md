
# BlogAPI

BlogAPI is a project based on an API developed with NodeJS and ExpressJS, the general purpose is to interact with a database in which the posts of a blog are managed.



## Technologies

- NodeJS
- ExpressJS
- Docker
- Swagger


## Features

- CRUD Implemented
- Manage of requests
- Database environment in Docker
- Swagger / API documentation
## Run Locally

Clone the project

```bash
  git clone https://github.com/Gxrco/BlogAPI.git
```

Go to the project directory

```bash
  cd BlogAPI
```

Install dependencies

```bash
  npm install
```

Build database image and run container

```bash
  docker build -t blogapi .
  docker run -p 3306:3306 blogapi
```

Start the server

```bash
  npm start
```


## Documentation

To view the API documentation, start the server instance on the default port and visit /api-doc address to get more information and interact with the API locally.

