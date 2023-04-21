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
import Explain_Modal from "./Explain_Modal";
import VizModal from "./VizModal";

/*
const GET_DATA = gql`
  query GetData($first: Int, $offset: Int, $PatientId: String) {
    GetPredictedLinks(first: $first, offset: $offset, PatientId: $PatientId) {
      gene_name
      gene_cui
      relation
      pheno_name
      pheno_cui
      score
    }
  }
`;
*/
const GET_DATA = gql`
  query GetData($PatientId: String) {
    links: GetPredictedLinks(PatientId: $PatientId) {
      gene_name
      gene_cui
      relation
      pheno_name
      pheno_cui
      score
    }
  }
`;


function PredictionsOne(props) {
  const {patient_id} = props
  const [page, setPage] = React.useState(0);
  const [rowsPerPage] = React.useState(10);
  const [explGene, setGene] = React.useState("");
  const [explPheno, setPheno] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [openViz, setOpenViz] = React.useState(false);

  const { loading, data, error } = useQuery(GET_DATA, {
    variables: {
      first: rowsPerPage,
      offset: rowsPerPage * page,
      PatientId: patient_id,
    },
  });

  const showDialog = (gene, pheno) => {
    gene == explGene || setGene(gene);
    pheno == explPheno || setPheno(pheno);
    setOpen(true);
  };

  const showVizDialog = (gene, pheno) => {
    gene == explGene || setGene(gene);
    pheno == explPheno || setPheno(pheno);
    setOpenViz(true);
  };

  const handleVizClose = () => {
    setOpenViz(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handlePagination = (prefix) => {
    if (prefix === "plus") {
      setPage(page + 1);
    } else {
      setPage(page - 1);
    }
  };

/*  
  const GET_PATHS_DATA = gql`
    query GetData(
      $first: Int
      $offset: Int
      $geno_cui: [String]
      $pheno_cui: [String]
      $length: Int
    ) {
      GetAllPathsLinks1(
        first: $first
        offset: $offset
        source_cui: $geno_cui
        target_cui: $pheno_cui
        length: $length
      ) {
        source_name
        target_name
        paths
      }
    }
  `;
*/
  const GET_PATHS_DATA = gql`
    query GetData(
      $geno_cui: [String]
      $pheno_cui: [String]
      $length: Int
      $first: Int
      $offset: Int
    ) {
      GetAllPathsLinks1(
        source_cui: $geno_cui
        target_cui: $pheno_cui
        length: $length
        first: $first
        offset: $offset
      ) {
        source_name
        target_name
        paths
      }
    }
  `;
  
  if (error) return <p>Error</p>;
  if (loading) return <p>Loading...</p>;

  return (
    <div>
      {open ? (
        <Explain_Modal
          geno={explGene}
          pheno={explPheno}
          open={open}
          onClose={handleClose}
          query={GET_PATHS_DATA}
          length={5}
        />
      ) : null}
      {openViz ? (
        <VizModal
          geno={explGene}
          pheno={explPheno}
          open={openViz}
          onClose={handleVizClose}
          query={GET_PATHS_DATA}
          length={5}
        />
      ) : null}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>gene_name</TableCell>
            <TableCell>gene_cui</TableCell>
            <TableCell>relation</TableCell>
            <TableCell>pheno_name</TableCell>
            <TableCell>pheno_cui</TableCell>
            <TableCell>score</TableCell>
            <TableCell>Explain...</TableCell>
            <TableCell>Visualize...</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.links[0] && data.links.map((n) => {
            return (
              <TableRow>
                <TableCell>{n.gene_name ? n.gene_name : "-"}</TableCell>
                <TableCell>{n.gene_cui ? n.gene_cui : "-"}</TableCell>
                <TableCell>{n.relation ? n.relation : "-"}</TableCell>
                <TableCell>{n.pheno_name ? n.pheno_name : "-"}</TableCell>
                <TableCell>{n.pheno_cui ? n.pheno_cui : "-"}</TableCell>
                <TableCell>{n.score ? n.score : "-"}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => showDialog([n.gene_cui], [n.pheno_cui])}
                  >
                    path
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => showVizDialog([n.gene_cui], [n.pheno_cui])}
                  >
                    Visualize
                  </Button>
                </TableCell>
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
            onClick={() => handlePagination("minus")}
            color="primary"
            disabled={page === 0 ? true : false}
          >
            Previous page
          </Button>
          <Button
            onClick={() => handlePagination("plus")}
            color="primary"
            disabled={/*data.links[0] && data.links.length === 10 ? false : */true}
          >
            Next page
          </Button>
        </div>
      )}
    </div>
  );
}

export default PredictionsOne;
