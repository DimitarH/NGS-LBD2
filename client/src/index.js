import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client'

console.log(`REACT_APP_GRAPHQL_URI: ${process.env.REACT_APP_GRAPHQL_URI}`)

const client = new ApolloClient({
  uri: process.env.REACT_APP_GRAPHQL_URI || 'http://212.235.239.171:64001/graphql',
//  uri: process.env.REACT_APP_GRAPHQL_URI || 'http://localhost:4001/graphql',
  cache: new InMemoryCache(),
})

const Main = () => (
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
)

ReactDOM.render(<Main />, document.getElementById('root'))