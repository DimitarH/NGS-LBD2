
import React from 'react'
import { useLazyQuery, gql } from '@apollo/client'
import CytoscapeComponent from 'react-cytoscapejs'

import {
    TextField,
    Button
} from '@material-ui/core'



const GET_CONCEPT = gql`
query networkGraph(
    $searchString: String!
){
    NeighbourGraph(searchString:$searchString) {
      id
      label
      source
      target
    }
  }

`

function NetworkViz(props) {
    const [startNode, setStartNode] = React.useState('')
    const [elements, setElements] = React.useState([])
    const [runQuery, { called, loading, data }] = useLazyQuery(GET_CONCEPT)
    const handleClick = () => { runQuery({ variables: { searchString: startNode } }) }
    /*
    const elements = [
        { data: { id: 'one', label: 'Node 1' } },
        { data: { id: 'two', label: 'Node 2' } },
        { data: { source: 'one', target: 'two', content: 'Edge from Node1 to Node2' } }
    ];
    */
    const layout = {
        name: 'cose',
        ready: function () { },
        stop: function () { },
        animate: true,
        animationEasing: undefined,
        animationDuration: undefined,
        animateFilter: function (node, i) { return true; },
        animationThreshold: 250,
        refresh: 20,
        fit: true,
        padding: 30,
        boundingBox: undefined,
        nodeDimensionsIncludeLabels: false,
        randomize: false,
        componentSpacing: 40,
        nodeRepulsion: function (node) { return 2048; },
        nodeOverlap: 4,
        edgeElasticity: function (edge) { return 32; },
        nestingFactor: 1.2,
        gravity: 1,
        numIter: 1000,
        initialTemp: 1000,
        coolingFactor: 0.99,
        minTemp: 1.0
    };

    const stylesheet = [
      {
        selector:'node',
        style:{
          label:'data(label)'
        }
      },

      {
        selector: 'edge',
        style: {
          label: 'data(label)'
        }
      }
    ]

    const handleFilterChange = (event) => {
        const val = event.target.value
        setStartNode(val)
    }

    function delete_null(obj) {
        for (var propName in obj) {
          if (obj[propName] === null || obj[propName] === undefined) {
            delete obj[propName];
          }
        }
        return obj
      }

    function clean(array) {
        let new_array = JSON.parse(JSON.stringify(array))
        let results = new_array.map((data) => {return {"data":delete_null(data)}})
        return results
      }

    return (
        <div>
            <TextField
                id="search"
                label="Concept"
                value={startNode}
                onChange={handleFilterChange}
                margin="normal"
                variant="outlined"
                type="text"
            />
            <Button variant="contained" color="primary" onClick={handleClick}>Run</Button>
            {data && data.NeighbourGraph ? <CytoscapeComponent elements={clean(data.NeighbourGraph)
            } layout={layout} style={{ width: '600px', height: '600px' }} stylesheet={stylesheet}/> : <h2>No data</h2>}

        </div>
    )
}

export default NetworkViz