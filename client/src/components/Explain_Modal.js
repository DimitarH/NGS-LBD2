import React from "react";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";

import { useQuery, gql } from "@apollo/client";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  Button,
} from "@material-ui/core";

function Explain_Modal(props) {
  const { query, geno, pheno, open, onClose } = props;
  const [page, setPage] = React.useState(0);
  const [rowsPerPage] = React.useState(10);

  const handleClose = () => {
    onClose();
  };

  const { loading, data, error } = useQuery(query, {
    variables: {
      first: rowsPerPage,
      offset: rowsPerPage * page,
      geno_cui: geno,
      pheno_cui: pheno,
      length: 5,
    },
  });

  const handlePagination = (prefix) => {
    if (prefix === "plus") {
      setPage(page + 1);
    } else {
      setPage(page - 1);
    }
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle onClose={handleClose}>
        <Button onClick={handleClose}>x</Button>
        All paths from "{geno}" to "{pheno}":
      </DialogTitle>
      <Table>
        {loading && !error && <TableBody>Loading...</TableBody>}
        <TableBody>
          {data && !loading && !error && (data.GetAllPathsLinks1.map((n) => {
            return (
              <TableRow>
                <TableCell>
                  {n.paths
                    ? n.paths
                        .map((el, index) =>
                          index === 0
                            ? el
                                .split("*-*")
                                .join("-")
                                .replace(/\*\*.*\*\*/, "")
                            : "-" +
                              el
                                .split("*-*")
                                .slice(1)
                                .join("-")
                                .split("**")
                                .slice(0, -2)
                                .join("**")
                                .replace(/\*\*.*\*\*/, "")
                        )

                    : "-"}
                </TableCell>
              </TableRow>
            );
          }))}
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
            disabled={data.GetAllPathsLinks1.length === 10 ? false : true}
          >
            Next page
          </Button>
        </div>
      )}
    </Dialog>
  );
}
export default Explain_Modal;
