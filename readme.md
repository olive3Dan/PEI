# GeoServer
1. Fazer Download e instalar o Docker: 

    https://docs.docker.com/desktop/install/windows-install/

2. Abrir o terminal na root do projeto e digitar: 
    
    docker compose up -d --build
    
3. Para desligar a App correr:

    docker compose down

### Project Structure  

    Client: 
        -Frontend openlayers 

    Server:
        -Backend comunication with postgres

    sql:
        -Initial setup of database

### Docker
    services
        database: 
            ports:
            - "5433:5432"
        pgadmin4
            ports:
              - "5050:80"
          server:
              ports:
              - "3000:3000"
          client:
              ports:
              - "8080:8000"
    network: geo

    Volumes that store the Postgress database data and pg4admin data
        - local_data
        - pgadmin-data

### Containers running (external ports)
    
    Client - http://localhost:8080/
    Pgadmin4 - http://localhost:5050/
    Server - http://localhost:3000/
    database - http://localhost:5433/

    postgress credentials
       user: postgres
       password: password

    pgadmin4 credentials
    user: daniel@test.com
    password: admin

### Configure pgadmin4 database connection 
    After login 
    --  Quick Links
            - Add new server
            CHECK the screenshots in the screenshots folder