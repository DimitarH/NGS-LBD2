# Pykeen Client Applications

This applications uses Flask to serve results from PyKeen model.
It takes two inputs:

* A list of genes
* A list of phenotypes

Test call:

```
curl -d '{"genes":["C0057488", "C1419067|9536"], "phenos":["C0086543", "C0004096"]}' -H "Content-Type: application/json" -X POST http://localhost:3000
```