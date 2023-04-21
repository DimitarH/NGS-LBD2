 
import React from 'react'
import { useTheme } from '@material-ui/core/styles'
import { Grid, Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { useQuery, gql } from '@apollo/client'
import clsx from 'clsx'
import Title from './Title'
import PatientsChart from './PatientsChart'
import PatientsPerPhenoCntChart from './PatientsPerPhenoCntChart'


const GET_COUNTS = gql`
{
  PatientCount
  ConceptCount
  GenotypeCount
  PhenotypeCount
}
`

function Dashboard(props) {
  const theme = useTheme()

  const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
    },
    paper: {
      padding: theme.spacing(2),
      display: 'flex',
      overflow: 'auto',
      flexDirection: 'column',
    },
    fixedHeight: {
      height: 280,
    },
  }))
  const classes = useStyles(theme)
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight)
  
  const { loading, data, error } = useQuery(GET_COUNTS)
  
  return (
    <React.Fragment>
      <Grid container spacing={2}>
        {/* Count of Patiens, Genotypes, Phenotypes */}
        <Grid item xs={12} md={8} lg={4}>
          <Paper className={fixedHeightPaper}>
            {/* <Counts /> */}
            {loading && !error && <p>Loading...</p>}
            {error && !loading && <p> Error  </p>}
            {data && !loading && !error && (
              <React.Fragment>
                <Title>Let us do some counting</Title>
                <Typography component="p" variant="h4">
                  <h6>
                    Number of patients:  {data.PatientCount} <br />
                    Number of genotypes:  {data.GenotypeCount} <br />
                    Number of phenotypes: {data.PhenotypeCount} <br />
                    Number of concepts:   {data.ConceptCount} 
                  </h6>   
                </Typography>
              </React.Fragment>
            )}
          </Paper>
        </Grid>
        {/* Patients status Chart*/}
        <Grid item xs={12} md={8} lg={7}>
          <Paper className={fixedHeightPaper}>
            <PatientsChart />
          </Paper>
        </Grid>
        {/* Patients per Phenotype count - Chart*/}
        <Grid item xs={12} md={8} lg={7}>
          <Paper className={fixedHeightPaper}>
            <PatientsPerPhenoCntChart />
          </Paper>
        </Grid>
      </Grid>
    </React.Fragment>
  )
}

export default Dashboard