import React from 'react';

function PatientTypeCbo(props)  {
    // const [patientType, setPatientType] = useState(props.value)

    const handleChange = (e) => {
        props.onPatientTypeChange(e.target.value);
    } 

    return(
        <label>
            PatientType :   
            <select value={props.value} onChange={handleChange}>
              {props.patientTypes.map((op) => 
                <option key={op} value={op}>{op}</option>
            )}
            </select>
        </label>
    );

}
export default PatientTypeCbo;
