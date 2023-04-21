import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TextField
} from '@material-ui/core'
//import { cyan } from '@material-ui/core/colors';
//import { dark } from '@material-ui/core/styles/createPalette';
import MarkSentence from './MarkSentence';
import SentenceList from './SentenceList';
import Title from './Title';
import {makeStyles} from '@material-ui/core/styles';

const Highlighted = ({ text = "", highlight = "" }) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${highlight})`, "gi");
  const parts = text.split(regex);

  return (
    <span>
      {parts.filter(String).map((part, i) => {
        return regex.test(part) ? (
          <mark key={i}>{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </span>
  );
};

const SimpleCitation = ({ text = "", contextFrom = "", relation = "", contextTo = ""}) => {
  const parts = text.split(" ");
  
  return (
    <span>
      {parts.filter(String).map((part, i) => {
        switch(part) {
          case contextFrom:
            return(<b><mark key={i} style={{color: "blue"}}>{part} </mark></b>) 
          case relation:
            return(<b><mark key={i} style={{color: "red"}}>{part} </mark></b>)
          case contextTo:
            return(<b><mark key={i} style={{color: "green"}}>{part} </mark></b>)
          default:
            return(<span key={i}>{part} </span>)
        }
      })}
    </span>
  );
};

const sentenceExample = {
  sentence: "Potential Role of Long Non-Coding RNA ANRIL in Pediatric Medulloblastoma Through Promotion on Proliferation and Migration by Targeting miR-323.",
  subject_start_index: 38,
  subject_end_index: 43, 
  predicate_start_index: 10,
  predicate_end_index: 14,
  object_start_index: 47,
  object_end_index: 72
} 

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  FormControl: {
    margin: 10,
    minWidth: 130,
  },
  Input: {
    marginTop: theme.spacing(2),
    margin: 10
  }
}));

function SearchRelation(props) {
  const [filterState, setFilterState] = React.useState({ 
    concept1: 'fox', relation: 'jumps', concept2: 'dog' 
  });
  const classes = useStyles();

  const handleFilterChange = (filterName) => (event) => {
    const val = event.target.value
    //setPage(0)
    setFilterState((oldFilterState) => ({
      ...oldFilterState,
      [filterName]: val,
    }))
  }

  return (
    <React.Fragment className={classes.root}>
      <Paper className={classes.FormControl}>
        <TextField className={classes.Input}
          id="cn1"
          label="Concept - source"
          value={filterState.concept1}
          onChange={handleFilterChange('concept1')}
          margin="normal"
          variant="outlined"
          type="text"
        />
        <TextField className={classes.Input}
          id="rlt"
          label="relation"
          value={filterState.relation}
          onChange={handleFilterChange('relation')}
          margin="normal"
          variant="outlined"
          type="text"
          color='secondary'
        />
        <TextField className={classes.Input}
          id="cn2"
          label="Concept - destination"
          value={filterState.concept2}
          onChange={handleFilterChange('concept2')}
          margin="normal"
          variant="outlined"
          type="text"
        />
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  Highlighting examples
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow key={1}>
                  <TableCell>{
                    <SimpleCitation
                      text="the quick brown fox jumps over the lazy dog"
                      contextFrom = {filterState.concept1}
                      relation = {filterState.relation}
                      contextTo = {filterState.concept2}
                    />}
                  </TableCell>
              </TableRow>
              <TableRow key={2}>
                  <TableCell>{
                    <Highlighted
                      text="Highlighted: the quick brown fox jumps over the lazy dog"
                      highlight="brown fox"
                    />}
                  </TableCell>
              </TableRow>
              <TableRow key={3}>
                  <TableCell>
                    {<MarkSentence
                      objSentence = {sentenceExample}
                    />}
                  </TableCell>
              </TableRow>
            </TableBody>
          </Table>  
      </Paper>
      <Paper className={classes.FormControl}>
        <Title> SentencesList component demo: </Title>
        {<SentenceList
          pSubject = 'xxx'
          pObject = 'yyy'
        />}           
      </Paper>
    </React.Fragment>
  )
}

export default SearchRelation