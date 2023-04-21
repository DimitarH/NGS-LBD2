 
import React from 'react'
import { useQuery, gql } from '@apollo/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Paper,
  TableSortLabel,
  TextField,
  Button
} from '@material-ui/core'


const GET_CONCEPT = gql`
query conceptsPaginate(
    $first: Int
    $offset: Int
    $orderBy: String
    $searchString: String
){
    ConceptByName(first: $first, offset: $offset, orderBy: $orderBy, searchString:$searchString) {
      name
      cui
      arg_rel_freq
      arg_inst_freq
      min_pyear
    }
  }

`

function SearchTable(props) {
  const [order, setOrder] = React.useState('asc')
  const [orderBy, setOrderBy] = React.useState('name')
  const [page, setPage] = React.useState(0)
  const [rowsPerPage] = React.useState(10)
  const [filterState, setFilterState] = React.useState({ searchString: '' })

  const getFilter = () => {
    return filterState.searchString.length > 0
      ? filterState.searchString
      : ""
  }

  const { loading, data, error } = useQuery(GET_CONCEPT, {
    variables: {
      first: rowsPerPage,
      offset: rowsPerPage * page,
      orderBy: orderBy + '_' + order,
      searchString: getFilter(),
    },
  })

  const handleSortRequest = (property) => {
    const newOrderBy = property
    let newOrder = 'desc'

    if (orderBy === property && order === 'desc') {
      newOrder = 'asc'
    }

    setOrder(newOrder)
    setOrderBy(newOrderBy)
  }

  const handleFilterChange = (filterName) => (event) => {
    const val = event.target.value
    setPage(0)
    setFilterState((oldFilterState) => ({
      ...oldFilterState,
      [filterName]: val,
    }))
  }

  const handlePagination = (prefix) => {
    if (prefix === "plus"){
      setPage(page + 1)
    }
    else{
      setPage(page - 1)
    }
  }

  return (
    <Paper>
      <h3>Search by concept name</h3>
      <TextField
        id="search"
        label="Concept Contains"
        value={filterState.searchString}
        onChange={handleFilterChange('searchString')}
        margin="normal"
        variant="outlined"
        type="text"
      />
      {loading && !error && <p>Loading...</p>}
      {error && !loading && <p>Error</p>}
      {data && !loading && !error && (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                key="name"
                sortDirection={orderBy === 'name' ? order : false}
              >
                <Tooltip title="Sort" placement="bottom-start" enterDelay={300}>
                  <TableSortLabel
                    active={orderBy === 'name'}
                    direction={order}
                    onClick={() => handleSortRequest('name')}
                  >
                    Name
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
              <TableCell
                key="cui"
                sortDirection={orderBy === 'cui' ? order : false}
              >
                <Tooltip title="Sort" placement="bottom-end" enterDelay={300}>
                  <TableSortLabel
                    active={orderBy === 'cui'}
                    direction={order}
                    onClick={() => handleSortRequest('cui')}
                  >
                    Cui
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
              <TableCell
                key="arg_rel_freq"
                sortDirection={orderBy === 'arg_rel_freq' ? order : false}
              >
                <Tooltip title="Sort" placement="bottom-start" enterDelay={300}>
                  <TableSortLabel
                    active={orderBy === 'arg_rel_freq'}
                    direction={order}
                    onClick={() => handleSortRequest('arg_rel_freq')}
                  >
                    arg_rel_freq
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
              <TableCell
                key="arg_inst_freq"
                sortDirection={orderBy === 'arg_inst_freq' ? order : false}
              >
                <Tooltip title="Sort" placement="bottom-start" enterDelay={300}>
                  <TableSortLabel
                    active={orderBy === 'arg_inst_freq'}
                    direction={order}
                    onClick={() => handleSortRequest('arg_inst_freq')}
                  >
                    arg_inst_freq
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
              <TableCell
                key="min_pyear"
                sortDirection={orderBy === 'min_pyear' ? order : false}
              >
                <Tooltip title="Sort" placement="bottom-start" enterDelay={300}>
                  <TableSortLabel
                    active={orderBy === 'min_pyear'}
                    direction={order}
                    onClick={() => handleSortRequest('min_pyear')}
                  >
                    min_pyear
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
              
            </TableRow>
          </TableHead>
          <TableBody>
            {data.ConceptByName.map((n) => {
              return (
                <TableRow key={n.cui}>
                  <TableCell component="th" scope="row">
                    {n.name}
                  </TableCell>
                  <TableCell>
                    {n.cui ? n.cui : '-'}
                  </TableCell>
                  <TableCell>{n.arg_rel_freq}</TableCell>
                  <TableCell>{n.arg_inst_freq}</TableCell>
                  <TableCell>{n.min_pyear}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>      
      )}
      {data && (
      <div style={{'display':'flex', 'justifyContent':'center', 'alignItems':'center'}}>
      <Button onClick={() => handlePagination("minus")} color='primary' disabled={page === 0 ? true : false}>Previous page</Button>
      <Button onClick={() => handlePagination("plus")} color='primary' disabled={data.ConceptByName.length === 10 ? false : true}>Next page</Button>
      </div>)}
      
    </Paper>
  )
}

export default SearchTable