import React from 'react'
import { useQuery, gql } from '@apollo/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
} from '@material-ui/core'

const GET_DATA = gql`
  query GetData(
    $first: Int
    $offset: Int
    $PatientId: String
  )
  { links: DirectLinkByPatient(
      first: $first 
      offset: $offset 
      PatientId: $PatientId
    ) 
    {
      g_name
      g_cui
      type_of_r2
      c1_name
      c1_cui
    }
  }
`
function DirectLinks(patient_id) {
  const [page, setPage] = React.useState(0)
  const [rowsPerPage] = React.useState(10)

  const { loading, data, error } = useQuery(GET_DATA, {
    variables: {
      first: rowsPerPage,
      offset: rowsPerPage * page,
      PatientId: patient_id,
    },
  })

  const handlePagination = (prefix) => {
    if (prefix === "plus"){
      setPage(page + 1)
    }
    else{
      setPage(page - 1)
    }
  }

  if (error) return <p>Error</p>
  if (loading) return <p>Loading...</p>

  return (<div>     
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>g_name</TableCell>
          <TableCell>g_cui</TableCell>
          <TableCell>type_of_r2</TableCell>
          <TableCell>c1_name</TableCell>
          <TableCell>c1_cui</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.links[0] && data.links.map((n) => {
          return (
            <TableRow>
              <TableCell>{n.g_name ? n.g_name : '-'}</TableCell>
              <TableCell>{n.g_cui ? n.g_cui : '-'}</TableCell>
              <TableCell>{n.type_of_r2 ? n.type_of_r2 : '-'}</TableCell>
              <TableCell>{n.c1_name ? n.c1_name : '-'}</TableCell>
              <TableCell>{n.c1_cui ? n.c1_cui : '-'}</TableCell>                  
            </TableRow>
          )
        })}
      </TableBody>
    </Table>   
    {data && (
      <div style={{'display':'flex', 'justifyContent':'center', 'alignItems':'center'}}>
        <Button 
          onClick={() => handlePagination("minus")} 
          color='primary'
          disabled={page === 0 ? true : false}
        >Previous page</Button>
        <Button
          onClick={() => handlePagination("plus")}
          color='primary'
          disabled={data.links[0] && data.links.length === rowsPerPage ? false : true}
        >Next page</Button>
      </div>)
    }           
  </div>)
}

export default DirectLinks
