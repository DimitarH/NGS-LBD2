/* 
  **********   Upload.js componet   *************
  It reads the Patient ID from a .vcf file 
  and stores it as a node into a database.
  ***********************************************
*/

import React from 'react'
import Title from './Title'
import Typography from '@material-ui/core/Typography'
import { gql, useMutation, useLazyQuery } from '@apollo/client'
import { CSVReader } from 'react-papaparse'
import Loader from "react-loader-spinner";
import Modal from 'react-modal';
import {
  Button,
  Divider
} from '@material-ui/core'
import {
  STORE_PHENOS,
  STORE_VARIANTS,
  FIND_EXISTING_PATIENTS,
  DELETE_EXISTING_PHENOS,
  DELETE_EXISTING_GENOS}  from './Upload/graphql_calls'



const phenoRef = React.createRef()
const variantsRef = React.createRef()

function Upload() {
  // States
  const [phenoData, setPhenoData] = React.useState(null)
  const [existingPatientsData, setExistingPatients] = React.useState([])
  const [variantsData, setVariantsData] = React.useState(null)
  const [phenoResult, setPhenoResult] = React.useState("")
  const [variantsResult, setVariantsResult] = React.useState("")
  const [phenoModalIsOpen, setPhenoIsOpen] = React.useState(false);
  const [genoModalIsOpen, setGenoIsOpen] = React.useState(false);

  // Mutations
  const [storePhenos, { loading: phenoLoading, error: phenoError }] = useMutation(STORE_PHENOS)
  const [storeVariants, { loading: vrntsLoading, error: vrntsError }] = useMutation(STORE_VARIANTS)
  const [deletePhenos] = useMutation(DELETE_EXISTING_PHENOS)
  const [deleteGenos] = useMutation(DELETE_EXISTING_GENOS)

  // Queries
  const [getPatientsPheno, { loading: findPatientsPhenoLoading, data: findPatientPhenoData, error: findPatientPhenoError }] = useLazyQuery(FIND_EXISTING_PATIENTS, {
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      if (findPatientPhenoData && findPatientPhenoData.FindExistingPatients) {
        setPhenoIsOpen(true)
      }
      else {
        storePhenos({ variables: { data: phenoData } })
          .then(() => setPhenoResult("Phenotypes Imported Successfuly"))
          .catch(e => { setPhenoResult("Neuspesen uvoz") })
      }
    }
  })

  const [getPatientsGeno, { loading: findPatientsGenoLoading, data: findPatientGenoData, error: findPatientGenoError }] = useLazyQuery(FIND_EXISTING_PATIENTS, {
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      if (findPatientGenoData && findPatientGenoData.FindExistingPatients) {
        setGenoIsOpen(true)
      }
      else {
        storeVariants({ variables: { data: phenoData } })
          .then(() => setVariantsResult("Phenotypes Imported Successfuly"))
          .catch(e => { setVariantsResult("Neuspesen uvoz") })
      }
    }
  })

  const storePhenoFile = () => {
    getPatientsPheno({ variables: { patient_ids: existingPatientsData } })
  }

  const storeVariantsFile = () => {
    getPatientsGeno({ variables: { patient_ids: existingPatientsData } })
  }

  const handlePhenoOpenDialog = (e) => {
    // Note that the ref is set async, so it might be null at some point
    if (phenoRef.current) {
      phenoRef.current.open(e)
    }
  }

  const handleVariantsOpenDialog = (e) => {
    // Note that the ref is set async, so it might be null at some point
    if (variantsRef.current) {
      variantsRef.current.open(e)
    }
  }

  const deduplicateArray = (value, index, self) => {
    return self.indexOf(value) === index;
  }

  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)'
    }
  };

  const handlePhenoLoad = (data) => {
    // Remove dots from keys as GraphQL does not support it
    let clean_data = data.map((el) => transformKeys(el.data))
    // Remove lines with missing data
    clean_data = clean_data.filter((el) => el.PatientID != "" && el.PatientID != null)

    // Check for existing patient ids
    let patient_ids = clean_data.map((el) => el.PatientID).filter(deduplicateArray)

    // Store results into react state
    setPhenoData(clean_data)
    setExistingPatients(patient_ids)

  }

  const handleVariantsLoad = (data) => {
    // Remove dots from keys as GraphQL does not support it
    let clean_data = data.map((el) => transformKeys(el.data))
    // Remove lines with missing data
    clean_data = clean_data.filter((el) => el.PatientID != "" && el.PatientID != null)
    // Check for existing patient ids
    let patient_ids = clean_data.map((el) => el.PatientID).filter(deduplicateArray)

    // Store results into react state
    setVariantsData(clean_data)
    setExistingPatients(patient_ids)
  }

  const handlePhenoRemoveFile = (e) => {
    // Note that the ref is set async, so it might be null at some point
    if (phenoRef.current) {
      phenoRef.current.removeFile(e)
    }
  }

  const handleVariantsRemoveFile = (e) => {
    // Note that the ref is set async, so it might be null at some point
    if (variantsRef.current) {
      variantsRef.current.removeFile(e)
    }
  }
  // Remove dots from object keys
  const transformKeys = (obj) => {
    return Object.keys(obj).reduce(function (o, prop) {
      var value = obj[prop];
      var newProp = prop.split(".").join("");
      o[newProp] = value;
      return o;
    }, {});
  }



  const closePhenoModal = () => {
    setPhenoIsOpen(false)
  }

  const closeGenoModal = () => {
    setGenoIsOpen(false)
  }

  const handlePhenoDelete = () => {

    deletePhenos({ variables: { patient_ids: existingPatientsData } })
      .then(() => storePhenos({ variables: { data: phenoData } })).then(() => {setPhenoResult("Phenotypes Imported Successfuly"); setPhenoData(null);})
      .catch(e => { setPhenoResult("Neuspesen uvoz") })
    setPhenoIsOpen(false)

  }

  const handleGenoDelete = () => {
    deleteGenos({ variables: { patient_ids: existingPatientsData } })
    .then(() => storeVariants({ variables: { data: variantsData } })).then(() => {setVariantsResult("Genotypes Imported Successfuly"); setVariantsData(null);})
    .catch(e => { setVariantsResult("Neuspesen uvoz") })
  setGenoIsOpen(false)
  }

  if (phenoLoading || vrntsLoading) {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader
        type="Puff"
        color="#00BFFF"
        height={200}
        width={200}
        timeout={30000}
      />
    </div>
  }

  return (
    <React.Fragment>
      <Title>Upload new data from a file</Title>

      <h2>Phenotype loading</h2>
      <CSVReader ref={phenoRef}
        onFileLoad={handlePhenoLoad}
        accept='text/csv, .csv, .tsv'
        config={{ header: true }}>
        {({ file }) => (
          <div style={{ display: "flex", flexDirection: "row", justifyContent:"center" }}>
            <Button
              onClick={handlePhenoOpenDialog}
              style={{ width: "30%" }}
              variant="contained"
            >
              Browse file
            </Button>
            <div style={{
              width: "40%",
              borderStyle: 'solid',
              borderColor: '#ccc'
            }}>
              {file && file.name}
            </div>
          </div>
        )}

      </CSVReader>
      <div style={{ marginTop: "5%", display: "flex", justifyContent: "center" }}>
        <Button onClick={storePhenoFile} variant="contained" style={{ width: "30%" }}
          color='primary' disabled={phenoData === null ? true : false}>Save phenotypes</Button>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <h3>
          {phenoError && <p>Error :( Please try again</p>}
          {!phenoData && phenoResult}
        </h3>
      </div>

      <div style={{ marginTop: "10%" }}>
        <Divider horizontal></Divider>
      </div>

      <h2>Genotype loading</h2>
      <CSVReader ref={variantsRef}
        onFileLoad={handleVariantsLoad}
        accept='text/csv, .csv, .tsv'
        config={{ header: true }}>
        {({ file }) => (
          <div style={{ display: "flex", flexDirection: "row", justifyContent:"center" }}>
            <Button
              onClick={handleVariantsOpenDialog}
              style={{ width: "30%" }}
              variant="contained"
            >
              Browse file
            </Button>
            <div style={{
              width: "40%",
              borderStyle: 'solid',
              borderColor: '#ccc'
            }}>
              {file && file.name}
            </div>
          </div>
        )}

      </CSVReader>
      <div style={{ marginTop: "5%", display: "flex", justifyContent: "center" }}>
        <Button onClick={storeVariantsFile} variant="contained" style={{ width: "30%" }}
          color='primary' disabled={variantsData === null ? true : false}>Save genotypes</Button>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <h3>
          {vrntsError && <p>Error :( Please try again</p>}
          {!variantsData && variantsResult}
        </h3>
      </div>

        <Modal
          isOpen={phenoModalIsOpen}
          style={customStyles}
        >
          <div>
            The patient ids in the file already exists in the database. <br />
            Do you want to override existing phenotypes or cancel the transaction?
          <div>
              <Button variant="contained" onClick={handlePhenoDelete}>Replace existing phenotypes</Button>
              <Button variant="contained" onClick={closePhenoModal} style={{marginLeft:"10px"}}>Cancel</Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={genoModalIsOpen}
          style={customStyles}
        >
          <div>
            The patient ids in the file already exist in the database. <br />
            Do you want to override existing genotypes or cancel the transaction?
          <div>
              <Button variant="contained" onClick={handleGenoDelete}>Replace existing genotypes</Button>
              <Button variant="contained" onClick={closeGenoModal} style={{marginLeft:"10px"}}>Cancel</Button>
            </div>
          </div>
        </Modal>
    </React.Fragment>
  )
}

export default Upload