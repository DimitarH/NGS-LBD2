# NGS-LBD
Using LBD (Literature-based Discovery) for the interpretation of NGS (Next Generation Sequencing) results

This project was funded by the Slovenian Research Agency (Grant No. J5-1780, project name: Using Literature-based Discovery for Interpretation of Next Generation Sequencing Results)

## Setup from zero

1. Clone repository
2. Seed database with the `seed_database.sh` script
3. Run all the microservices with `docker-compose up --build -d`

If you want to play around with container ports, you can edit `docker-compose.yml` file. 

## Instructions

Start the project with 

```
docker-compose up
```

Once the containers are ready, create a node in Neo4j with

```
CREATE (t:Test{name:'test'})
```

And then you can use the express API application to fetch data with the following url in your browser:

```
url: http://localhost:3000/?Query=MATCH (n1) RETURN n1 LIMIT 5
```

## Restart API container with new data

First, ssh into server. Next, you have to run the following script to be root

```
sudo su
```

Now you can go to the specific folder:

```
cd /home/bratanic/NGS-LBD/
```

Fetch the latest data from git with the following command:

```
git pull
```

And finally, run the following script to rebuild API container

```
docker-compose up --build -d api
```

if you want to rebuild graphQL container then

```
docker-compose up --build -d graphql
```

If you want to rebuild all the docker images

```
docker-compose up --build -d
```


### Create Fulltext index and add to graphQL

First create a FT index:

```
CALL db.index.fulltext.createNodeIndex("ConceptName",["Concept"],["name"])
```

Then add the following Query to GraphQL schema:

```
type Query {
  ConceptByName(searchString: String): [Concept] @cypher(
    statement: """
      CALL db.index.fulltext.queryNodes(
        'ConceptName', $searchString+'~') 
      YIELD node RETURN node LIMIT 20
    """
  )
}
```
