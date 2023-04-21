import React from "react";
import { useQuery, gql } from "@apollo/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
} from "@material-ui/core";

const GET_DATA = gql`
  query GetData($first: Int, $PatientId: String, $after: String) {
    patients(where: { patient_id: $PatientId }) {
      genosConnection(first: $first, after: $after) {
        edges {
          variant_position
          functional_impact
          cadd_score
        }
        pageInfo {
          hasNextPage
          startCursor
          hasPreviousPage
          endCursor
        }
      }
    }
  }
`;

function Genotype(patient_id) {
  const [after, setAfter] = React.useState(null);
  const [rowsPerPage] = React.useState(10);

  const { loading, data, error } = useQuery(GET_DATA, {
    variables: {
      PatientId: patient_id,
      first: rowsPerPage,
      after: after,
    },
  });

  const handlePagination = (cursor) => {
    setAfter(cursor);
  };

  if (error) return <p>Error fetching Genotype for {patient_id}.</p>;
  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>variant_position</TableCell>
            <TableCell>functional_impact</TableCell>
            <TableCell>cadd_score</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.patients &&
            data.patients[0] &&
            data.patients[0].genosConnection.edges.map((n) => {
              return (
                <TableRow>
                  <TableCell>
                    {n.variant_position ? n.variant_position : "-"}
                  </TableCell>
                  <TableCell>
                    {n.functional_impact ? n.functional_impact : "-"}
                  </TableCell>
                  <TableCell>{n.cadd_score ? n.cadd_score : "-"}</TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
      {data && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button
            onClick={() => handlePagination(null)}
            color="primary"
            disabled={
              data.patients &&
              data.patients[0] &&
              data.patients[0].genosConnection.pageInfo.hasPreviousPage
                ? false
                : true
            }
          >
            First page
          </Button>
          <Button
            onClick={() =>
              handlePagination(
                data.patients[0].genosConnection.pageInfo.endCursor
              )
            }
            color="primary"
            disabled={
              data.patients &&
              data.patients[0] &&
              data.patients[0].genosConnection.pageInfo.hasNextPage
                ? false
                : true
            }
          >
            Next page
          </Button>
        </div>
      )}
    </div>
  );
}

export default Genotype;
