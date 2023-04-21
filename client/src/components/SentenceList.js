import React from 'react'
import { useQuery, gql } from '@apollo/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button
} from '@material-ui/core';
//import {makeStyles} from '@material-ui/core/styles';
import MarkSentence from './MarkSentence';

/********************************************************
 * Component returns a list of marked sentences.
 * Sentences are fetched from the database 
 * together with the info how to mark them.
 * 
 * Input parameters are defined by a GraphQL query:
 *  Subject
 *  Object
 * This pair of values defines the citations
 * that sentences are part of.
********************************************************/

const GET_DATA = gql`
  query GetData(
    $first: Int
    $offset: Int
    $subject: String
    $object: String
  ){
    GetCitationData(first: $first, offset: $offset, subject: $subject, object: $object) {
      sentence
      predicate_start_index
      predicate_end_index
      subject_start_index
      object_start_index
    }
  }
`
const headerTxt = "Sentence(s) with subject (ASPIRIN) predicating (TREATS) an object (HEADACHE)."
const sentenceHeader = {
  sentence: headerTxt,
  subject_start_index: headerTxt.indexOf('ASPIRIN'),
  subject_end_index: headerTxt.indexOf('ASPIRIN') + 7, 
  predicate_start_index: headerTxt.indexOf('TREATS'),
  predicate_end_index: headerTxt.indexOf('TREATS') + 6,
  object_start_index: headerTxt.indexOf('HEADACHE'),
  object_end_index: headerTxt.indexOf('HEADACHE') + 8
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


/************************* Component function ********************************/
function SentenceList(props) {
  const {pObject, pSubject} = props

  const [page, setPage] = React.useState(0);
  const rowsPerPage = 10;

  const { loading, data, error } = useQuery(GET_DATA, {
    variables: {
      first: rowsPerPage,
      offset: rowsPerPage * page,
      subject: pSubject,
      object: pObject
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

  if (loading) return <p>Loading...</p>
  //if (error) return <p>Error</p>
  let renderData = data;
    if (error) { 
    /* Inform the user about the error and show a demo */
    renderData = {
      GetCitationData: [
        {
          sentence: "Error: There is a problem fetching data " +
                    "from the database. " +
                    "What follows is just an example ...",
          subject_start_index: 49,
          subject_end_index: 57, 
          predicate_start_index: 26,
          predicate_end_index: 34,
          object_start_index: 35,
          object_end_index: 39
        }, 
        sentenceExample,
        sentenceExample,
        sentenceExample
      ]
    }
  }

  return (
    <div>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{
                <MarkSentence
                  objSentence = {sentenceHeader}
                />}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableCell>
            {renderData.GetCitationData.map((n) => {
              return (
                <TableRow>
                  {<MarkSentence
                    objSentence = {n}
                  />}
                </TableRow>
              )
            })}
          </TableCell>
        </TableBody>
      </Table>            
      {renderData && (
        <div style={{'display':'flex', 
                     'justifyContent':'center', 
                     'alignItems':'center'}}>
          <Button 
            onClick = {() => handlePagination("minus")}
            color = 'primary'
            disabled = {page === 0 ? true : false}
          >Previous page</Button>
          <Button 
            onClick = {() => handlePagination("plus")} 
            color = 'primary' 
            disabled = {renderData.GetCitationData.length === 10 ? false : true}
          >Next page</Button>
        </div>)
      }           
    </div>
  )
}

export default SentenceList
