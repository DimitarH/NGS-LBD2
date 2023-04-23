echo Fetching data

if [ ! -f ./neo4j/backup/'semmed43cord19.dump' ]; then
    wget https://www.dropbox.com/s/1fzi43umt6u49pm/semmed43cord19.dump?dl=1 -O /home/gbergant/ngslbd/neo4j/backup/semmed43cord19.dump
    # mv 'semmed43cord19.dump?dl=1' /home/gbergant/ngslbd/neo4j/backup/semmed43cord19.dump
fi

if [ ! -f ./neo4j/import/gnomad.v2.1.1.lof_metrics.by_gene.txt ]; then
    wget https://storage.googleapis.com/gcp-public-data--gnomad/release/2.1.1/constraint/gnomad.v2.1.1.lof_metrics.by_gene.txt.bgz
    gunzip -c gnomad.v2.1.1.lof_metrics.by_gene.txt.bgz > gnomad.v2.1.1.lof_metrics.by_gene.txt
    mv gnomad.v2.1.1.lof_metrics.by_gene.txt neo4j/import/
fi



echo Starting Neo4j

docker-compose up -d neo4jngs

sleep 20

echo Restoring data
echo Restoring semmed43cord19

docker exec -it neo4jngs neo4j stop
docker exec -it neo4jngs bin/neo4j-admin load --from=/backup/'semmed43cord19.dump' --database=semmed43cord19 --force
docker exec -it neo4jngs neo4j start

echo Configuring priviliges and creating databases

docker exec -it neo4jngs chown -R neo4j:neo4j /data

docker exec -it neo4jngs cypher-shell -u neo4j -p ngslbd2020 'CREATE DATABASE semmed43cord19;'
docker exec -it neo4jngs cypher-shell -u neo4j -p ngslbd2020 'CREATE INDEX ensembl
                                                                FOR (n:Concept)
                                                                ON (n.ensembl_gene_id);'
docker exec -it neo4jngs cypher-shell -u neo4j -p ngslbd2020 'CREATE USER read_only
                                                              SET PASSWORD "read_only_ngslbd2020" CHANGE NOT REQUIRED;'
docker exec -it neo4jngs cypher-shell -u neo4j -p ngslbd2020 'GRANT ROLE reader TO read_only;
'
                                                                

echo Stop database

docker-compose stop

echo Rewrite default database setting

sed -i 's/dbms.default_database=graph/dbms.default_database=semmed43cord19/g' neo4j/conf/neo4j.conf 

echo Seeding Neo4j is finished
