// Powered by DevExtreme React Components. See https://www.npmjs.com/package/devextreme-react

import React, { useState } from 'react';
import PatientPheno from './PatientPheno';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
//import PatientType from './PatientTypeCbo';
//import PatientsCbo from './PatientsCbo'
import Grid from '@material-ui/core/Grid';
//import Paper from '@material-ui/core/Paper';
import PatientTypeSelect from './patient-type-select';
import PatientSelect from './patient-select';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(3),
    textAlign: 'center',
    color: theme.palette.text.primary,
  },
}));

function App()  {
    const classes = useStyles();
    const patTypes = [ "Open", "Closed", "All"]
    const [patientType, setPatientType] = useState(patTypes[0])
    const [patient, setPatient] = useState("")

    const handlePatientTypeChange = (pType) => {
        setPatientType(pType);
    } 

    const handlePatientChange = (p) => {
      setPatient(p);
  } 
    return (
      <div className={classes.root}>
        <Container maxWidth="lg">
        <Grid container  spacing={2}>
          <AppBar position="sticky" >
            <Toolbar>
              <IconButton>
                  <MenuIcon />
              </IconButton>
              NGS-LDB
              <Button>
                Home
              </Button>
            </Toolbar>
          </AppBar> 
          <Grid item xl={3} lg={3} md={4} sm={12} xs={12} className={classes.paper}>
            <PatientTypeSelect value={patientType} patientTypes={patTypes} onPatientTypeChange={handlePatientTypeChange} /> 
          </Grid>
          <Grid item xl={3} lg={3} md={4} sm={12} xs={12} className={classes.paper}>
            <PatientSelect pType={patientType} onPatientChange={handlePatientChange} /> 
          </Grid>
          {/*<Grid item xl={4} lg={4} md={4} sm={12} xs={12} className={classes.paper}>
            <PatientType value={patientType} patientTypes={patTypes} onPatientTypeChange={handlePatientTypeChange} /> 
          </Grid>
        
          <Grid item  xl={4} lg={4} md={4} sm={12}  xs={12}>
            <PatientsCbo pType={patientType} onPatientChange={handlePatientChange} />
          </Grid>
          */}
         {/* <Grid item  xl={2} lg={2} md={2} sm={12} xs={12}>
            <Button color="primary">Search</Button> 
          </Grid> */}
          <Grid item  xl={12} lg={12} md={12} sm={12} xs={12}>
              <PatientPheno patient={patient}/>
          </Grid>  
        </Grid>
        </Container>
      </div>  
    );   

}
export default App;

