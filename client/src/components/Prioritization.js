import React from "react";
import { useQuery, gql } from "@apollo/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TextField,
  MenuItem,
  Button,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Genotype from "./Genotype";
import DirectLinks from "./DirectLinks";
import IndirectLinks from "./IndirectLinks";
import PredictionsOne from "./PredictionsOne";
import KlemensPrioritizer from "./KlemensPrioritizer";

const GET_DATA = gql`
  query PatientData(
    $first: Int
    $offset: Int
    $patientId: String
  ) 
  {
    patients {
      patient_id
    }
    phenotype: patients( where: { patient_id: $patientId }) {
      phenos (options: { limit: $first, offset: $offset }) {
        hpo_id
        name
        umls_cui
      }
    }
  }
`;

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  FormControl: {
    margin: 20,
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  h6: {
    margin: 20,
  },
}));

const initialPrioritiserStates = { p1: 0, p2: 0, p3: 0 };

function Prioritization(props) {
  const classes = useStyles();
  const [patientID, setPatientID] = React.useState("");
  const [tabValue, setTabValue] = React.useState(0);
  const [param1Bool, setParam1Bool] = React.useState(1);
  const [inheritanceModel, setInheritanceModel] = React.useState(1);
  const [prioritiser, setPrioritiser] = React.useState(0);
  const [prioritiserState, setPrioritiserState] = React.useState(
    initialPrioritiserStates
  );
  const [prioritizeOn, setPrioritizeOn] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage] = React.useState(10);

  React.useEffect(() => {
    setPatientID(JSON.parse(window.localStorage.getItem("patientID")));
    setPrioritiser(JSON.parse(window.localStorage.getItem("prioritiser")));
    setTabValue(JSON.parse(window.localStorage.getItem("tabValue")));
    setPrioritizeOn(JSON.parse(window.localStorage.getItem("prioritizeOn")));
    setPrioritiserState(
      JSON.parse(window.localStorage.getItem("prioritizerState"))
    );
  }, []); // Runs only on the first render

  React.useEffect(() => {
    window.localStorage.setItem("patientID", JSON.stringify(patientID));
  }, [patientID]);

  React.useEffect(() => {
    window.localStorage.setItem("prioritiser", prioritiser);
  }, [prioritiser]);

  React.useEffect(() => {
    window.localStorage.setItem("tabValue", tabValue);
  }, [tabValue]);

  React.useEffect(() => {
    window.localStorage.setItem("prioritizeOn", prioritizeOn);
  }, [prioritizeOn]);

  const PrState = JSON.stringify(prioritiserState);
  React.useEffect(() => {
    window.localStorage.setItem(
      "prioritizerState",
      JSON.stringify(prioritiserState)
    );
  }, [PrState]);

  const getFilter = () => {
    return typeof patientID === "string" ? patientID : "";
  };

  const { loading, data, error } = useQuery(GET_DATA, {
    variables: {
      first: rowsPerPage,
      offset: rowsPerPage * page,
      PatientId: getFilter(),
    },
  });

  const handlePagination = (prefix) => {
    if (prefix === "plus") {
      setPage(page + 1);
    } else {
      setPage(page - 1);
    }
  };

  const handleClick = () => {
    setPrioritizeOn(1); // PRIORITIZE button is activated
    if (prioritiser === 1) {
      setTabValue(3); // INDIRECT LINKS tab
      if (prioritiserState.p1 === 0) {
        setPrioritiserState({ ...prioritiserState, p1: 1 });
      }
    } else if (prioritiser === 2) {
      setTabValue(4); // PREICTIONS-1 tab
      if (prioritiserState.p2 === 0) {
        setPrioritiserState({ ...prioritiserState, p2: 1 });
      }
    } else if (prioritiser === 3) {
      setTabValue(5); // KLEMENS'S tab
      if (prioritiserState.p3 === 0) {
        setPrioritiserState({ ...prioritiserState, p3: 1 });
      }
    } else if (tabValue < 2) {
      // if pheno or geno tabs are active change to
      setTabValue(2); // DIRECT LINKS tab
    }
  };

  const getPrioritizeFilter = () => {
    if (prioritizeOn === 1) {
      return getFilter();
    } else {
      return "";
    }
  };

  const checkPrioritizer = (prioritizerID) => {
    /*if (prioritiser == prioritizerID) {
      // chosen prioritizer matches the TAB
       return true
      // ... or check if the prioritizer is already activated
    } else */
    if (prioritizerID === 1) {
      return prioritiserState.p1 === 1 ? true : false;
    } else if (prioritizerID === 2) {
      return prioritiserState.p2 === 1 ? true : false;
    } else if (prioritizerID === 3) {
      return prioritiserState.p3 === 1 ? true : false;
    } else {
      return false;
    }
  };

  const enableData = (prioritizerID) => {
    // to fetch the data on selected Patient data Tab
    // or not to fetch ... (Now is the question.)
    return prioritizeOn === 1 && // PRIORITIZE button is cliked and
      checkPrioritizer(prioritizerID) &&
      patientID // and patient is selected
      ? true
      : false;
  };

  const handleFilterChange = (event, newValue) => {
    setPatientID(newValue);
    setPrioritizeOn(0);
    setPrioritiserState(initialPrioritiserStates);
    if (tabValue > 1) {
      // if other than PHENO or GENO tabs are active change to PHENOTYPE
      setTabValue(0);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleParam1BoolChange = (event) => {
    setParam1Bool(event.target.value);
  };

  return (
    <React.Fragment>
      <Paper>
        <Typography variant="h6" className={classes.h6}>
          Select a patient
        </Typography>
        {data && data.patients[0] && !loading && !error && (
          <Autocomplete
            className={classes.FormControl}
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            id="search"
            value={patientID}
            onChange={handleFilterChange}
            options={data.patients.map((option) => option.patient_id)}
            getOptionLabel={(option) => {
              // Value selected with enter, right from the input
              if (typeof option === "string") {
                return option;
              }
              // Add "xxx" option created dynamically
              if (option.inputValue) {
                return option.inputValue;
              }
              // Regular option
              return option.patient_id;
            }}
            style={{ width: 300 }}
            renderInput={(params) => (
              <TextField {...params} label="Patient ID" variant="outlined" />
            )}
          />
        )}
      </Paper>
      <Paper>
        <Typography variant="h6" className={classes.h6}>
          Set Filtering Parameters
        </Typography>
        <FormControl className={classes.FormControl}>
          <TextField
            label="Minimum variant call quality:"
            id="margin-none"
            type="number"
            InputLabelProps={{ shrink: true }}
            helperText="Phred (input number)"
          />
        </FormControl>
        <FormControl className={classes.FormControl}>
          <TextField
            label="Filter for genes:"
            id="margin-none"
            defaultValue="Default Value"
            className={classes.textField}
            helperText="Some important text"
          />
        </FormControl>
        <FormControl className={classes.FormControl}>
          <InputLabel id="simple-boolean-label">Parameter1 boolean</InputLabel>
          <Select
            labelId="simple-boolean-label"
            id="simple-select"
            value={param1Bool}
            onChange={handleParam1BoolChange}
          >
            <MenuItem value={1}>True</MenuItem>
            <MenuItem value={0}>False</MenuItem>
          </Select>
          <FormHelperText>Some important helper text</FormHelperText>
        </FormControl>
        <FormControl className={classes.FormControl}>
          <InputLabel id="inheritance-model-label">
            Inheritance model:
          </InputLabel>
          <Select
            labelId="inheritance-model-label"
            id="inheritance-model"
            value={inheritanceModel}
            onChange={(event) => setInheritanceModel(event.target.value)}
            margin="normal"
          >
            <MenuItem value={1}>Autosomal dominant</MenuItem>
            <MenuItem value={2}>Autosomal recessive</MenuItem>
            <MenuItem value={3}>X-Dominant</MenuItem>
            <MenuItem value={4}>Y-Recessive</MenuItem>
            <MenuItem value={5}>Mitochondrial</MenuItem>
          </Select>
        </FormControl>
      </Paper>
      <Paper>
        <Typography variant="h6" className={classes.h6}>
          Choose Prioritiser
        </Typography>
        <FormControl className={classes.FormControl}>
          <InputLabel id="prioritiser-label">
            Prioritise genes using:
          </InputLabel>
          <Select
            labelId="prioritiser-label"
            id="prioritiser"
            value={prioritiser}
            onChange={(event) => setPrioritiser(event.target.value)}
            margin="normal"
          >
            <MenuItem value={0}>None - filter only</MenuItem>
            <MenuItem value={1}>Indirect links</MenuItem>
            <MenuItem value={2}>Predictions 1</MenuItem>
            <MenuItem value={3}>All shortest path count</MenuItem>
          </Select>
          <FormHelperText>select and click on PRIORITIZE button</FormHelperText>
        </FormControl>
        <Button
          className={classes.root}
          variant="contained"
          onClick={handleClick}
        >
          PRIORITIZE
        </Button>
      </Paper>
      <Paper elevation={1}>
        <Typography variant="h6" className={classes.h6}>
          Patient data
        </Typography>
        <div className={classes.root}>
          <AppBar position="static">
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="simple tabs"
            >
              <Tab label="Phenotype" {...a11yProps(0)} />
              <Tab label="Genotype" {...a11yProps(1)} />
              <Tab label="Direct links" {...a11yProps(2)} />
              <Tab label="Indirect links" {...a11yProps(3)} />
              <Tab label="Predictions-1" {...a11yProps(4)} />
              <Tab label="All shortest path count" {...a11yProps(5)} />
            </Tabs>
          </AppBar>
          <TabPanel value={tabValue} index={0}>
            {loading && !error && <p>Loading...</p>}
            {error && !loading && <p> Error </p>}
            {data && !loading && !error && (
              <div>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>HPO_id</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>umls_cui</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    { data.phenotype && data.phenotype[0] && 
                      data.phenotype[0].phenos[0] &&
                      data.phenotype[0].phenos.map((n) => {
                        return (
                          <TableRow>
                            <TableCell>{n.hpo_id ? n.hpo_id : "-"}</TableCell>
                            <TableCell>{n.name ? n.name : "-"}</TableCell>
                            <TableCell>
                              {n.umls_cui ? n.umls_cui : "-"}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    }
                  </TableBody>
                </Table>
                {data && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Button
                      onClick={() => handlePagination("minus")}
                      color="primary"
                      disabled={page === 0 ? true : false}
                    >
                      Previous page
                    </Button>
                    <Button
                      onClick={() => handlePagination("plus")}
                      color="primary"
                      disabled={
                        data.phenotype[0] && data.phenotype[0].phenos.length === 10
                          ? false
                          : true
                      }
                    >
                      Next page
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            {Genotype(getFilter())}
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            {DirectLinks(getPrioritizeFilter())}
          </TabPanel>
          <TabPanel value={tabValue} index={3}>
            {enableData(1) ? ( //{1}>Indirect links
              <IndirectLinks patient_id={patientID} />
            ) : (
              <p>No patient is selected or the prioritizer is not activated</p>
            )}
          </TabPanel>
          <TabPanel value={tabValue} index={4}>
            {enableData(2) ? ( //{2}>Predictions 1
              <PredictionsOne patient_id={patientID} />
            ) : (
              <p>No patient is selected or the prioritizer is not activated</p>
            )}
          </TabPanel>
          <TabPanel value={tabValue} index={5}>
            {enableData(3) ? ( //{3}>All shortest path count
              <KlemensPrioritizer patient_id={patientID} />
            ) : (
              <p>No patient is selected or the prioritizer is not activated</p>
            )}
          </TabPanel>
        </div>
      </Paper>
    </React.Fragment>
  );
}

export default Prioritization;
