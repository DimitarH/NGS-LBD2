import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 150,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

function PatientTypeSelect (props) {
    const classes = useStyles();
    // const [state, setState] = React.useState({
    //   age: '',
    //   name: 'hai',
    // });
  
    // const handleChange = (event) => {
    //   const name = event.target.name;
    //   setState({
    //     ...state,
    //     [name]: event.target.value,
    //   });
    // };
    const handleChange = (e) => {
        props.onPatientTypeChange(e.target.value);
    } 

    return (
        <FormControl variant="outlined" className={classes.formControl}>
        <InputLabel htmlFor="select_patient_type_id">Patient type:</InputLabel>
        <Select
            native
            value={props.value}
            onChange={handleChange}
            label="Patient type:"
            inputProps={{
            //name: 'age',
            id: 'select_patient_type_id',
            }}
        >
            { props.patientTypes.map((op) => 
                        <option key={op} value={op}>{op}</option>
            )}
        </Select>
        </FormControl>
    );
  }

export default PatientTypeSelect;