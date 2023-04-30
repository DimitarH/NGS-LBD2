
console.log(process.env); 

const express = require('express');
const app = express();

const port = process.env.port || 3000;

// Next two lines needed for using the Pug template engine in Express.js
app.set('views', './views');
app.set('view engine', 'pug')

const queryParameterName = 'Query';
const api_key  = process.env.api_key || "NZTXG3DCMQ="

const uri      = process.env.neo4j_uri  || 'neo4j://neo4jngs:7687';
// Was:
// const dbName   = process.env.dbName     || 'semmed43cord19'
const dbName   = process.env.dbName     || 'semmed432202'
const user     = process.env.neo4j_user || 'read_only';
const password = process.env.password   || 'read_only_ngslbd2020'


const neo4j  = require('neo4j-driver');
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
const db = {database: dbName};



function getResult(sQuery) {
// return result of input Query run upon neo4j database
  const session = driver.session(db);

  return new Promise(resolve => {
    session.readTransaction(tx => tx.run(sQuery)).then(result => {
      resolve(result);
      session.close();
    }).catch(err => {
      resolve(err.message);
      session.close();
      console.log('getResult error: ' + err.message);
    })
  });
}

function getPatients() {
// returns a list of patients from the database 
  const patient_query = `MATCH (p:Patient) RETURN p LIMIT 100`;
  const session = driver.session(db);

  return new Promise(resolve => {
    session.readTransaction(tx => tx.run(patient_query)).then(result => {
      resolve(result);
      session.close();
    }).catch(err => {
      resolve(err.message);
      session.close();
      console.log('getResult error: ' + err.message);
    })
  });
}

function getPatients2() {
  // returns a list of patients from the database as a map,
  // it also returns a randomly generated "status" field, 
  // which should be added to the data model later 
    // Entering multiline strings with "\" at the end of line (there is NO \n in the string)  

    const patient_query = 'match (p:Patient) return {patient_id: p.patient_id, \
      status: CASE toInteger(round(rand())) \
       WHEN 0 THEN "open" \
       WHEN 1 THEN "closed" \
      END}'; 
/*
    // Entering multiline strings with `` (template strings) (there is a \n at each end of line)
    // '' allows interpolation e.g. ${expression} in the string gets interpolated  
    const patient_query = `match (p:Patient) return {patient_id: p.patient_id,
      status: CASE toInteger(round(rand()))
       WHEN 0 THEN "open"
       WHEN 1 THEN "closed"
      END}`; 
*/
      
    //const patient_query = `MATCH (p:Patient) RETURN p LIMIT 100`;
    const session = driver.session(db);
  
    return new Promise(resolve => {
      session.readTransaction(tx => tx.run(patient_query)).then(result => {
        resolve(result);
        session.close();
      }).catch(err => {
        resolve(err.message);
        session.close();
        console.log('getResult error: ' + err.message);
      })
    });
  }
 

function getPatient(sPatient) {
// returns single patient node for the input Patient_id from the database 
  const patient_query = `MATCH (p:Patient) WHERE p.id = $patient_id RETURN p`;
  const session = driver.session(db);

  return new Promise(resolve => {
    session.readTransaction(tx => tx.run(patient_query, {
      "patient_id": sPatient
    })).then(result => {
      resolve(result);
      session.close();
    }).catch(err => {
      resolve(err.message);
      session.close();
      console.log('getResult error: ' + err.message);
    })
  });
}
  
function getPatientPheno(sPatient) {
// return PHENOTYPES for the input Patient_id from the database 
  /**  
   * The query returns a single map constructed from p,r,pheno 
   * to simplify the client processing.
   * Maybe later we should use "parent_lvl:toString(r.parent_lvl)"
   * to convert "parent_lvl" to string so that it is only one field.
   * As an integer, parent_lvl is represented in the map as a sub-map, 
   * e.g.: "parent_lvl":{"low":2,"high":0}
  */
  const match_q  = 'MATCH (p:Patient)-[r:PHENO]->(pheno)';
  const where_q  = ' WHERE p.id = $patient_id';
  const return_q = ' RETURN'
                 + ' {patient_id :p.patient_id'
                 + ', parent_lvl :r.parent_lvl'
                 + ', hpo_id     :pheno.hpo_id'
                 + ', label      :pheno.label'
                 + ', umls_cui   :pheno.umls_cui'
                 + ', name       :pheno.name'
                 + '}';

  const patient_query = match_q + where_q + return_q;
  const session = driver.session(db);

  return new Promise(resolve => {
    session.readTransaction(tx => tx.run(patient_query, {
      "patient_id": sPatient
    })).then(result => {
      resolve(result);
      session.close();
    }).catch(err => {
      resolve(err.message);
      session.close();
      console.log('getResult error: ' + err.message);
    })
  });
}

function getPatientGeno(sPatient) {
  // return PHENOTYPES for the input Patient_id from the database 
    const patient_query = `MATCH (p:Patient)-[:GENO]->(geno) WHERE p.id = $patient_id RETURN p, geno`;
    const session = driver.session(db);
      
    return new Promise(resolve => {
      session.readTransaction(tx => tx.run(patient_query, {
        "patient_id": sPatient
      })).then(result => {
        resolve(result);
        session.close();
      }).catch(err => {
        resolve(err.message);
        session.close();
        console.log('getResult error: ' + err.message);
      })
    });
  }

  function getPatientGenoInteresting(sPatient) {
    // return PHENOTYPES for the input Patient_id from the database 
      const patient_query = `MATCH (p:Patient)-[r:GENO]->(geno) WHERE p.id = $patient_id AND r.interesting = 2 RETURN p, geno`;
      const session = driver.session(db);
   
      return new Promise(resolve => {
        session.readTransaction(tx => tx.run(patient_query, {
          "patient_id": sPatient
        })).then(result => {
          resolve(result);
          session.close();
        }).catch(err => {
          resolve(err.message);
          session.close();
          console.log('getResult error: ' + err.message);
        })
      });
    }
  
function main() {
  app.get('/patients', (req, res) => {
    if (req.query.api_key === api_key) {
      (async function() {
        return await getPatients()
      })().then(str => {
        console.log('Patients list. ' || req.query);
        res.send(str);
        //res.render('query', str);
      })
    } else {
      res.status(400);
      res.send("Wrong authorization, patients list denied.");
    }
  });

  app.get('/patients2', (req, res) => {
    if (req.query.api_key === api_key) {
      (async function() {
        return await getPatients2()
      })().then(str => {
        console.log('Patients list. ' || req.query);
        //Next line to return a map with only relevant data for the client application:
        res.send({records: str.records.map(record => record._fields[0])});        
        // Next line return the full response from Neo4j
        // res.send(str);
        //res.render('query', str);
      })
    } else {
      res.status(400);
      res.send("Wrong authorization, patients list denied.");
    }
  });

  
  app.get('/patients/:patient_id/', (req, res) => {
    if (req.query.api_key === api_key) {
      (async function(q) {
        return await getPatient(q)
      })(req.params.patient_id).then(str => {
        console.log(req.query)
        console.log('Patient ID: ' + req.params.patient_id);
        res.send(str);
      })
    } else {
      res.status(400);
      res.send("Wrong authorization, Patient ID ignored.");
    }
  });

  app.get('/patients/:patient_id/pheno/', (req, res) => {
    if (req.query.api_key === api_key) {
      (async function(q) {
        return await getPatientPheno(q)
      })(req.params.patient_id).then(str => {
        console.log(req.query)
        console.log('Phenotypes for Patient ID: ' + req.params.patient_id);
        //Next line to return a map with only relevant data for the client application:
        res.send({records: str.records.map(record => record._fields[0])});        
        // Next line return the full response from Neo4j
        // res.send(str);
      })
    } else {
      res.status(400);
      res.send("Wrong authorization, patient's phenotypes denied.");
    }
  });

  app.get('/patients/:patient_id/geno/', (req, res) => {
    if (req.query.api_key === api_key) {
      (async function(q, b) {
        return await getPatientGeno(q)
      })(req.params.patient_id).then(str => {
        console.log(req.query)
        console.log('Genotypes for Patient ID: ' + req.params.patient_id);
        res.send(str);
      })
    } else {
      res.status(400);
      res.send("Wrong authorization, patient's genotypes denied.");
    }
  });

  app.get('/patients/:patient_id/geno/interesting', (req, res) => {
    if (req.query.api_key === api_key) {
      (async function(q) {
        return await getPatientGenoInteresting(q)
      })(req.params.patient_id).then(str => {
        console.log(req.query)
        console.log('Interesting genotypes for Patient ID: ' + req.params.patient_id);
        res.send(str);
      })
    } else {
      res.status(400);
      res.send("Wrong authorization, patient's interesting genotypes denied.");
    }
  });

  app.get('/query', (req, res) => {
    if (req.query.api_key === api_key) {
      (async function(q) {
        return await getResult(q)
      })(req.query.Query).then(str => {
        console.log(req.query)
        console.log('Query: ' + req.query.Query);
        res.send(str);
      })
    } else {
      res.status(400);
      res.send("Wrong authorization, Query ignored");
    }
  });

  // Like above, but renders the result with Pug
  app.get('/query2', (req, res) => {
    if (req.query.api_key === api_key) {
      (async function(q) {
        return await getResult(q)
      })(req.query.Query).then(str => {
        console.log(req.query)
        console.log('Query: ' + req.query.Query);
        //was: res.send(str);
        // res.render('query', str);
        //Next line to return a map which only relevant data for the client application. To test pheno:
        res.render('pheno', {records: str.records.map(record => record._fields[0])});        

      })
    } else {
      res.status(400);
      res.send("Wrong authorization");
    }
  });

  app.get('/test', function (req, res) {
    // render with Pug template engine
    res.render('test', { title: 'Hey', message: 'Hello there!', lines: ['line1','line2','line3','line4'] })
  })


  app.listen(port, () => console.log(`API app listening at http://localhost:${port}`));
}

main();

