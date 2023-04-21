import React from "react";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import Cytoscape from "cytoscape";
import CytoscapeComponent from "react-cytoscapejs";
import dagre from "cytoscape-dagre";
import "./vizModal.css";

import { useQuery, gql } from "@apollo/client";
import { Button, DialogContent } from "@material-ui/core";

Cytoscape.use(dagre);

const layout = {
  name: "dagre",
  fit: true,
  nodeSep: 250,
  rankSep: 150,
  transform: (node, pos) => {
    return { x: pos.y * 2, y: pos.x / 2 };
  },
};

function VizModal(props) {
  const { query, geno, pheno, open, onClose, length } = props;
  const [page, setPage] = React.useState(0);
  const [rowsPerPage] = React.useState(30);
  const [visible, setVisible] = React.useState(false);
  const [conceptName, setConceptName] = React.useState(false);
  const [x, setX] = React.useState(0);
  const [y, setY] = React.useState(0);
  
  let popupElement = (
    <div
      style={{
        width: 150,
        zIndex: 1000,
        height: 150,
        marginLeft: -7,
        marginTop: -7,
        position: "absolute",
        cursor: "pointer",
        top: 0,
        left: 0,
        border: "1px solid",
        transform: `translate(${x}px, ${y}px)`,
        background: "#F2F3F5"
        // visibility: "hidden",
      }}
      >
      <p>{conceptName}</p>
  </div>
  );

  const handleClose = () => {
    onClose();
  };

  const { loading, data, error } = useQuery(query, {
    variables: {
      first: rowsPerPage,
      offset: rowsPerPage * page,
      geno_cui: geno,
      pheno_cui: pheno,
      length: length,
    },
  });

  const stylesheet = [
    {
      selector: "node",
      style: {
        label: "data(label)",
        width: "data(size)",
        height: "data(size)",
      },
    },

    {
      selector: "edge",
      style: {
        label: "data(label)",
        targetArrowShape: "triangle",
        curveStyle: "bezier",
        width: "data(size)",
      },
    },
  ];

  if (error) return <p>Error</p>;
  if (loading) return <p>Loading...</p>;

  const clean = (data) => {
    const nodeSet = new Set();
    const relSet = new Set();
    let min = 10e10;
    let max = 0;

    data.map((el) => {
      el.paths.map((path) => {
        let triples = path.replace(">", "").split("*-*");
        let source = triples[0].split("**");
        let target = triples[2].split("**");

        max = source[1] > max || target[1] > max ? Math.max(source[1], target[1]) : max;
        min = source[1] < min || target[1] < min ? Math.min(source[1], target[1]) : min;
        nodeSet.add(source);
        nodeSet.add(target);
        relSet.add(
          JSON.stringify({
            data: {
              source: source[0],
              target: target[0],
              label: triples[1].split("**")[0],
              size: triples[1].split("**")[1],
            },
          })
        );
      });
    });
    let nodes = [...nodeSet].map((el) => {
      return ({
      data: {
        id: el[0],
        label: el[0],
        size: (((el[1] - min) / (max - min)) + 1) * 33,
      },
    })});
    let rels = [...relSet].map((el) => JSON.parse(el));
    return [...nodes, ...rels];
  };

  const hide = () => {
      setVisible(false)
  }

  return (
    <Dialog onClose={handleClose} open={open} fullWidth maxWidth="lg">
      <DialogContent style={{ minHeight: "80vh", minWidth: "80vw" }}>
        <DialogTitle onClose={handleClose}>
          <Button onClick={handleClose}>x</Button>
          All paths from "{geno}" to "{pheno}":
        </DialogTitle>
        {conceptName ? popupElement : null}
        {data && data.GetAllPathsLinks1 ? (
          <CytoscapeComponent
            cy={(cy) => {
                // bind the event to node click
              cy.on("tap", "node", (_evt) => {
                console.log(_evt);
                let position = _evt.renderedPosition;
                setX(position.x + 50)
                setY(position.y)
                setVisible(true);
                setConceptName(_evt.target[0]['_private'].data.label)
              });
              // bind the event to canvas click
              cy.on("tap", (_evt) => {
                  if (_evt.target == cy) {
                    setConceptName(false)
                  }
              })
            }}
            elements={clean(data.GetAllPathsLinks1)}
            layout={layout}
            style={{ width: "80vw", height: "75vh" }}
            stylesheet={stylesheet}
          />
        ) : (
          <h2>No data</h2>
        )}
      </DialogContent>
    </Dialog>
  );
}
export default VizModal;
