echo Seeding OMIM data

docker exec -it neo4jngs cypher-shell -u neo4j -p ngslbd2020 -d semmed43cord19 'CREATE INDEX cui FOR (c:Concept) ON (c.cui);'
docker exec -it neo4jngs cypher-shell -u neo4j -p ngslbd2020 -d semmed43cord19 'CREATE INDEX omim FOR (c:Concept) ON (c.omim);'
docker exec -it neo4jngs cypher-shell -u neo4j -p ngslbd2020 -d semmed43cord19 'LOAD CSV WITH HEADERS FROM "file:///omim/OMIM_UMLS.tsv" AS row FIELDTERMINATOR "\t"
                                                                                MATCH (c:Concept)
                                                                                WHERE c.cui = row.`UMLS.ID`
                                                                                SET c.omim = replace(row.`OMIM.ID`,"OMIM","MIM");'
docker exec -it neo4jngs cypher-shell -u neo4j -p ngslbd2020 -d semmed43cord19 'LOAD CSV WITH HEADERS FROM "file:///omim/OMIM_ENTREZ.csv" AS row FIELDTERMINATOR "|"
                                                                                WITH row, split(row.`:START_ID`,':')[1] AS entrezId
                                                                                MATCH (g)
                                                                                WHERE g:gngm OR g:aapp
                                                                                WITH g, row, entrezId
                                                                                WHERE entrezId in split(g.cui, "|")
                                                                                SET g.omim = row.`:END_ID`;'
docker exec -it neo4jngs cypher-shell -u neo4j -p ngslbd2020 -d semmed43cord19 'LOAD CSV WITH HEADERS FROM "file:///omim/mim_relationships.csv" AS row FIELDTERMINATOR "|"
                                                                                WITH row WHERE row.Phenotype_Mapping_Method = "Disorder has known molecular basis. Mutation found."
                                                                                MATCH (s:Concept), (t:Concept)
                                                                                WHERE s.omim = row.`:START_ID` AND t.omim = row.`:END_ID`
                                                                                MERGE (t)-[r:CAUSES]->(s)
                                                                                SET r.source = "OMIM";'
docker exec -it neo4jngs cypher-shell -u neo4j -p ngslbd2020 -d semmed43cord19 'LOAD CSV WITH HEADERS FROM "file:///omim/mim_relationships.csv" AS row FIELDTERMINATOR "|"
                                                                                WITH row WHERE row.Phenotype_Mapping_Method <> "Disorder has known molecular basis. Mutation found."
                                                                                MATCH (s:Concept), (t:Concept)
                                                                                WHERE s.omim = row.`:START_ID` AND t.omim = row.`:END_ID`
                                                                                MERGE (t)-[r:ASSOCIATED_WITH]->(s)
                                                                                SET r.source = "OMIM";'






