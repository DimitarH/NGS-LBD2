import { gql } from '@apollo/client'

export const STORE_PHENOS = gql`
  mutation StorePhenoType($data:[PhenoInput]!){
    StorePhenotype(data: $data) {
      result
    }
  }
`
export const STORE_VARIANTS = gql`
  mutation StoreVariants($data:[VariantsInput]!){
    StoreVariants(data: $data) {
      result
    }
  }
`

export const FIND_EXISTING_PATIENTS = gql`
  query FindExistingPatients($patient_ids: [String]) {
    FindExistingPatients(patients:$patient_ids)
  }
`

export const DELETE_EXISTING_PHENOS = gql`
  mutation DeletePhenos($patient_ids: [String]) {
    DeletePhenos(patient_ids:$patient_ids)
    
}
`
export const DELETE_EXISTING_GENOS = gql`
  mutation DeleteGenos($patient_ids: [String]) {
    DeleteGenos(patient_ids:$patient_ids)
    
}
`