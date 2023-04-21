
import React, {useState,  useEffect } from 'react';
// import Select from '@material-ui/core/Select'
// import MenuItem from '@material-ui/core/MenuItem'

function PatientsCbo(props)  {
    
    const [patients,setPatients] = useState([]);
    const patientsUrl = "http://ngs-lbd.mf.uni-lj.si:64000/patients2/?api_key=NZTXG3DCMQ="
    let pType = props.pType.toLowerCase();

    const handleChange = (e) => {
        props.onPatientChange(e.target.value);
    } 
    useEffect(() => {
        fetch(patientsUrl) 
        .then(res => res.json())
        .then(data => 
            pType !== "all" ?
            setPatients(data.records
                .filter(p => p.patient_id != null && p.patient_id.length < 70 && p.status === pType)
                .map(p => p.patient_id))
            :
            setPatients(data.records
                .filter(p => p.patient_id != null && p.patient_id.length < 70 )
                .map(p => p.patient_id))
        );
    },[pType])

    return(
        <label>
            Choose patient:  
            <select onChange={handleChange}> 
              {patients.map((op, index) => 
                <option key={index} value={op}>{op}</option>
              )}
            </select>
        </label>
    );

}
export default PatientsCbo;
