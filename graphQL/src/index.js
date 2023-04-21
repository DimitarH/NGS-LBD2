import { typeDefs } from './graphql-schema'
import { ApolloServer } from 'apollo-server'
import express from 'express'
import neo4j from 'neo4j-driver'
import { Neo4jGraphQL } from "@neo4j/graphql";
import dotenv from 'dotenv'
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { GraphQLInputInt } from 'graphql-input-number'
import depthLimit from 'graphql-depth-limit'

// set environment variables from .env
dotenv.config()

const app = express()

/*
 * Create a Neo4j driver instance to connect to the database
 * using credentials specified as environment variables
 * with fallback to defaults
 */
const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://neo4jngs:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'ngslbd2020'
  )
)

/*
const LimitAmountInt = GraphQLInputInt({
  name: 'LimitAmountInt',
  min: 1,
  max: process.env.MAX_FIRST || 1000,
});

const resolvers = {
  LimitedInt: LimitAmountInt
}
*/

const neoSchema = new Neo4jGraphQL({ typeDefs, driver });

const main = async () => {
  const schema = await neoSchema.getSchema();

  const server = new ApolloServer({
    schema,
    context: { driverConfig: { database: "semmed432202" } },
    introspection: true,
    playground: true,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    validationRules: [depthLimit(process.env.MAX_QUERY_DEPTH || 5)]
  });

  await server.listen(process.env.GRAPHQL_PORT || 4001);

  console.log("Online");
}

main();