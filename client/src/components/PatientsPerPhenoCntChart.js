import React from 'react'
import { useTheme } from '@material-ui/core/styles'
import {
  Bar,
  XAxis,
  YAxis,
  Label,
  ResponsiveContainer,
  BarChart,
} from 'recharts'
import { useQuery, gql } from '@apollo/client'
import Title from './Title'

const GET_DATA_QUERY = gql`
  {
    PatientsPerPhenoCount {
      PhenoCount
      Patients
    }
  }
`

export default function PatientsPerPhenoCntChart() {
    const theme = useTheme()
  
    const { loading, error, data } = useQuery(GET_DATA_QUERY)
    if (error) return <p>Error</p>
    if (loading) return <p>Loading...</p>
  
    return (
      <React.Fragment>
        <Title>Patients per Pheno Count</Title>
        <ResponsiveContainer>
          <BarChart
            data={data.PatientsPerPhenoCount}
            margin={{
              top: 16,
              right: 16,
              bottom: 0,
              left: 24,
            }}
          >
            <XAxis dataKey="PhenoCount" stroke={theme.palette.text.secondary} />
            <YAxis stroke={theme.palette.text.secondary}>
              <Label
                angle={270}
                position="left"
                style={{ textAnchor: 'middle', fill: theme.palette.text.primary }}
              >
                Patients
              </Label>
            </YAxis>
            <Bar dataKey="Patients" fill={theme.palette.primary.main}></Bar>
          </BarChart>
        </ResponsiveContainer>
      </React.Fragment>
    )
  }