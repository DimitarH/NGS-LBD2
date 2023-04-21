import React, { useState, useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import {
    SortingState,
        IntegratedSorting,
    PagingState,
        IntegratedPaging,
    SummaryState,
    IntegratedSummary,
    GroupingState,
    IntegratedGrouping,
  DataTypeProvider,
  SearchState,
  IntegratedFiltering,
  
} from '@devexpress/dx-react-grid';
import {
  Grid,
  Table,
  VirtualTable,
  Toolbar,
  SearchPanel,
  TableHeaderRow,
  TableGroupRow,
  TableSummaryRow,
  PagingPanel,
  GroupingPanel,
  DragDropProvider,
  TableColumnResizing,
} from '@devexpress/dx-react-grid-material-ui';


import { Loading } from './material_ui/components/loading';
//import { CurrencyTypeProvider } from './material_ui/components/currency-type-provider';

//const URL = 'https://js.devexpress.com/Demos/WidgetsGalleryDataService/api/orders?requireTotalCount=true';

function PatientPheno (props)  {
    const URL1 = 'http://ngs-lbd.mf.uni-lj.si:64000/patients/';
    const URL2 = '/pheno/?api_key=NZTXG3DCMQ='
    const patient = props.patient 
    let URL = URL1 + patient + URL2;

    const [columns] = useState([
        { name: 'hpo_id', title: 'hpo_id' },
        { name: 'parent_lvl', title: 'parent_lvl' },
       // { name: 'patient_id', title: 'patient_id'},
        { name: 'name', title: 'name' },
        { name: 'umls_cui', title: 'umls_cui' },
        { name: 'label', title: 'label' },
      ]);

      const [rows, setRows] = useState([]);
     // const [currencyColumns] = useState(['SaleAmount']);
    //   const [tableColumnExtensions] = useState([
    //     { columnName: 'name', align: 'left' },
    //     { columnName: 'label', align: 'left' },
    //   ]);
      const [sorting, setSorting] = useState([]);
    //  const [totalCount, setTotalCount] = useState(0);
      //const [pageSize, setPageSize] = useState(10);
      const [pageSizes] = useState([10, 20, 30, 0]);
      //const [currentPage, setCurrentPage] = useState(0);
      const [loading, setLoading] = useState(false);
      const [grouping, setGrouping] = useState([]);
      const [totalSummaryItems] = useState([
        { columnName: 'hpo_id', type: 'count' }
      ]);

      const [groupSummaryItems] = useState([]);

      const [defaultColumnWidths] = useState([
        { columnName: 'hpo_id', width: 180 },
        { columnName: 'parent_lvl', width: 150 },
       // { columnName: 'patient_id', width: 100 },
        { columnName: 'umls_cui', width: 150 },
        { columnName: 'name', width: 350 },
        { columnName: 'label', width: 350 },
      ]);
     // const [searchValue, setSearchState] = useState('');
   
      useEffect(() => {
        if(patient !== "") {
          setLoading(true);
            fetch(URL)
            .then(response => response.json())
            .then(function(data) {
                    //alert(data.records)
                    //let newTotalCount = data.records.length
                    setRows(data.records.map((p) => {
                       return { hpo_id: p.hpo_id,
                                parent_lvl: p.parent_lvl.low,
                               // patient_id: p.patient_id,
                                name: p.name,
                                umls_cui: p.umls_cui,
                                label: p.label          
                              }
                    } ));
                   // setTotalCount(newTotalCount);
                    setLoading(false);
                })
            .catch(() => setLoading(false));
            }
      },[URL]);
    
      return (
        <Paper style={{ position: 'relative' }}>
          <Grid
            rows={rows}
            columns={columns}
          >     
        <SearchState defaultValue="" />
        <IntegratedFiltering />
        <SortingState
          sorting={sorting}
          onSortingChange={setSorting}
         />
         <IntegratedSorting />
         <GroupingState
           grouping={grouping}
           onGroupingChange={setGrouping}
        />
        <IntegratedGrouping />
        <SummaryState
          totalItems={totalSummaryItems}
          groupItems={groupSummaryItems}
        />
        <IntegratedSummary />
        {/**/}
       <PagingState
            defaultCurrentPage={0}
            defaultPageSize={10}
        />
        <IntegratedPaging />
        {/*<VirtualTable /> */}
        <Table />
        <TableColumnResizing defaultColumnWidths={defaultColumnWidths} />
        <DragDropProvider />
        <Toolbar />
        <GroupingPanel />
        <TableHeaderRow  showSortingControls />
        <SearchPanel />    
        {/**/}
        <PagingPanel
          pageSizes={pageSizes}
        />          
        
        <TableGroupRow />
        <TableSummaryRow />
        </Grid>
          {loading && <Loading />}
        </Paper>

      );
    };
    

export default PatientPheno;
 