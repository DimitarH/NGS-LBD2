import React, { useState } from 'react';
import Paper from '@material-ui/core/Paper';
import {
  SortingState,
  IntegratedSorting,
  PagingState,
  IntegratedPaging,
} from '@devexpress/dx-react-grid';
import {
  Grid,
  Table,
  TableHeaderRow,
  PagingPanel,
} from '@devexpress/dx-react-grid-material-ui';


import { generateRows } from './demo-data/generator';

const PatientData = () => {
  const [columns] = useState([
    { name: 'name', title: 'Name' },
    { name: 'gender', title: 'Gender' },
    { name: 'city', title: 'City' },
    { name: 'car', title: 'Car' },
  ]);
  const [rows] = useState(generateRows({ length: 100 }));
  const [pageSizes] = React.useState([10, 20, 30]);
  
  return (
    <Paper>
      <Grid
        rows={rows}
        columns={columns}
      >
        <SortingState
          defaultSorting={[{ columnName: 'city', direction: 'asc' }]}
        />
        <IntegratedSorting />
        <PagingState
          defaultCurrentPage={0}
          defaultPageSize={10}
        />
        <IntegratedPaging />
        
        <Table />
        <TableHeaderRow showSortingControls />
        <PagingPanel 
          pageSizes={pageSizes}
        />
      </Grid>
    </Paper>
  );
};

export default PatientData;

