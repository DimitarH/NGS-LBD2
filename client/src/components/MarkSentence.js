import React from 'react'

/********************************************************
 * Component returns a marked sentence.
 * The sentece and the indexes defining the slices to be marked
 * are passed in by the parameter.
 * 
 * Input parameter objSentence is defined as:
 * {
 *  sentence: <string>,
 *  subject_start_index:   <number>, subject_end_index:   <number>,
 *  predicate_start_index: <number>, predicate_end_index: <number>,
 *  object_start_index:    <number>, object_end_index :   <number>
 * }
 ********************************************************/
function MarkSentence(props) {
  const {objSentence} = props;

  // Define the style of each markation
  const subjectStyle   = {color: "red"};
  const predicateStyle = {color: "purple"};
  const objectStyle    = {color: "blue"};

  // create a sorted array out of all indexes 
  const indexes = [
    objSentence.subject_start_index, 
    objSentence.subject_end_index,
    objSentence.predicate_start_index, 
    objSentence.predicate_end_index,
    objSentence.object_start_index, 
    objSentence.object_end_index 
  ].sort();

  // split the sentence according indexes
  const sentencePart = [
    objSentence.sentence.substring(0, indexes[0]),
    objSentence.sentence.substring(indexes[0], indexes[1]), // first slice
    objSentence.sentence.substring(indexes[1], indexes[2]),
    objSentence.sentence.substring(indexes[2], indexes[3]), // second slice
    objSentence.sentence.substring(indexes[3], indexes[4]),
    objSentence.sentence.substring(indexes[4], indexes[5]), // third slice
    objSentence.sentence.substring(indexes[5])
  ];

  // identify all the sentence parts (slices) to be higlighted
  const subject = objSentence.sentence.substring(
    objSentence.subject_start_index, 
    objSentence.subject_end_index
  );
  const predicate = objSentence.sentence.substring(
    objSentence.predicate_start_index, 
    objSentence.predicate_end_index
  );
  const anObject = objSentence.sentence.substring(
    objSentence.object_start_index, 
    objSentence.object_end_index
  );

  // return the whole sentence with highlighted slices
  return (
    <span>
      {sentencePart.filter(String).map((part, i) => {
        switch(part) {
          case subject:
            return(<b><span key={i} style={subjectStyle}>{part}</span></b>) 
          case predicate:
            return(<b><span key={i} style={predicateStyle}>{part}</span></b>)
          case anObject:
            return(<b><span key={i} style={objectStyle}>{part}</span></b>)
          default:
            return(<span key={i}>{part}</span>)
        }
      })}
    </span>
  );
};

export default MarkSentence