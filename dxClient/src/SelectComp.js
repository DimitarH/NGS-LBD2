import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
//import NativeSelect from '@material-ui/core/NativeSelect';
const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

export default function NativeSelects() {
  const classes = useStyles();
  const [state, setState] = React.useState({
    age: '',
    name: 'hai',
  });

  const handleChange = (event) => {
    const name = event.target.name;
    setState({
      ...state,
      [name]: event.target.value,
    });
  };

  return (
    <FormControl className={classes.formControl}>
    <InputLabel shrink htmlFor="age-native-label-placeholder">
      Patient Type: 
    </InputLabel>
    <Select
      value={state.PatientType}
      onChange={handleChange}
      inputProps={{
        name: 'PatientType',
        id: 'age-native-label-placeholder',
      }}
    >    
      <option value={"Open"}>Open</option>
      <option value={"Closed"}>Closed</option>
      <option value={"All"}>All</option>
    </Select>
    <FormHelperText>...</FormHelperText>
  </FormControl>
  )
}