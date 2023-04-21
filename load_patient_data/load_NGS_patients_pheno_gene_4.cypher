### Tomaz:BEGIN ###
##############
# 2019-06-19 #
#####################################################################
# This is a consolidated version of how to load patients, phenotype and genotype data
# into a neo4j database that already contains SemMedDB arguments/concepts (nodes) and
# semantic relations between these nodes.
#####################################################################

########################
# Now the graph database is separated in two parts:
# 1. general one (SemMedDB, OMIM, Entrez Gene, HPO, ...). This is prepared and loaded by Mitko
# 2. patient data (phenotypes and variants for patients). Gaber prepares the input data, Mitko the load scripts, Gaber runs these scripts
#######################

##################################
# New 2019-06-19:
load csv with headers from "file:///PHENOTYPES.tsv" as line FIELDTERMINATOR '\t' 
merge (p:Patient {id: line["PatientID"]})
  on create set p.patient_id=line["PatientID"]
merge (t:HPO {id: line["HPO.ID"]})
  on create set t.name=line["HPO.Label"], t.hpo_id=line["HPO.ID"], t.label=line["HPO.Label"], t.umls_cui=line["UMLS.ID"]
merge (c:Concept {cui: line["UMLS.ID"]})
  on create set c.semmed = false
merge (p)-[r:PHENO {parent_lvl: toInteger(line["PARENT_LVL"])}]->(t)
merge (p)-[r2:PHENO_UMLS {parent_lvl: toInteger(line["PARENT_LVL"])}]->(c);

# 03.07.2019:
# Added 1079 labels, created 1079 nodes, set 17570 properties, created 15397 relationships, completed after 1862 ms.
# 06.12.2019:
# Added 1085 labels, created 1085 nodes, set 17388 properties, created 15182 relationships, completed after 4034 ms.

create index on :Patient(id);
create index on :HPO(id);
create index on :HPO(name);

# 03.07.2019
# 06.12.2019
# END: Load PHENOTYPES.tsv 
##################################

##########################
# 03.07.2019:
# Load Patient genetic Variants
##########################
USING PERIODIC COMMIT 1000
load csv with headers from "file:///VARIANTS.tsv" as line FIELDTERMINATOR '\t' 
with line where not (line["Entrez.Gene.ID"] is null or line["Entrez.Gene.ID"]="NA")
merge (p:Patient {id: line["PatientID"]})
merge (c:Concept {cui: line["Entrez.Gene.ID"]})
ON CREATE SET c:gngm, c.cui=line["Entrez.Gene.ID"], c.name=line["GeneName"], c.gene_symbol=line["GeneName"], c.entrez_gene_id=line["Entrez.Gene.ID"], c.ensembl_gene_id=line["Ensembl.Gene.ID"], c.semmed=false
ON MATCH SET c:gngm, c.gene_symbol=line["GeneName"], c.entrez_gene_id=line["Entrez.Gene.ID"], c.ensembl_gene_id=line["Ensembl.Gene.ID"]
CREATE (p)-[r:GENO {variant_position:line["VariantPosition"], cadd_score:toFloat(line["CADDscore"]), functional_impact:line["FunctionalImpact"], HTZinSLO:toInteger(line["HTZinSLO"]), HMZinSLO:toInteger(line["HMZinSLO"]), ExACGeneralMAF:toFloat(line["ExACGeneralMAF"]), GnomADAlleleCount:toInteger(line["GnomADAlleleCount"]), GnomADHMZ:toInteger(line["GnomADHMZ"]), UK10KAlleleCount:toInteger(line["UK10KAlleleCount"]), SIFT:line["SIFT"], PolyPhen2:line["PolyPhen2"], MutationTaster:line["MutationTaster"], SplicingPredictionScore:toFloat(line["SplicingPredictionScore"]), ClinVar:line["ClinVar"], SIFT_modified:toFloat(line["SIFT_modified"]),	PolyPhen2_modified:toFloat(line["PolyPhen2_modified"]),	MutationTaster_modified:toFloat(line["MutationTaster_modified"])}]->(c);

# 03.07.2019:
# Added 538 labels, created 264 nodes, set 2021078 properties, created 102474 relationships, completed after 9668 ms.
# 06.12.2019:
# Added 5308 labels, created 2532 nodes, set 2030150 properties, created 102474 relationships, completed after 11102 ms.

# END: Load patient variants 03.07.2019
########################################
########################################

##########################
# 17.01.2020:
# Load/Updata Patient genetic Variants with ADDITIONAL data
##########################
# Create an index on :Concept(ensembl_gene_id) for fast "match"
CREATE INDEX ON :Concept(ensembl_gene_id);

load csv with headers from "file:///gnomad.v2.1.1.lof_metrics.by_gene.txt" as line FIELDTERMINATOR '\t'
match (g:Concept {ensembl_gene_id: line["gene_id"]})
set g.exac_pLI=toFloat(line["exac_pLI"]), g.mis_z=toFloat(line["mis_z"]);
# Set 28859 properties, completed after 811 ms.

# Ranking variants:
# SET interesting=2 IF (functional_impact = "HIGH") and (exac_pLI > 0.9) 
match (p:Patient)-[r1:GENO {functional_impact: "HIGH"}]->(g:Concept) where g.exac_pLI>0.9
set r1.interesting=2;
# Set 583 properties, completed after 584 ms.

# SET interesting=1 IF (functional_impact <> "HIGH") and (mis_z > 3.09)
match (p:Patient)-[r1:GENO]->(g:Concept) 
where r1.functional_impact<>"HIGH" and g.mis_z>3.09
set r1.interesting=1;   
# Set 5503 properties, completed after 260 ms.

# Break-down of variants by interestingness:
match ()-[r:GENO]->() return r.interesting,count(*);

╒═══════════════╤══════════╕
│"r.interesting"│"count(*)"│
╞═══════════════╪══════════╡
│null           │96388     │
├───────────────┼──────────┤
│1              │5503      │
├───────────────┼──────────┤
│2              │583       │
└───────────────┴──────────┘

# END: 17.01.2020 Load/Upadate patient variants ADDITIONAL data
########################################
### Tomaz:END ###

# 2020-01-24
# Find interesting=2 and export them to csv from neo4j. Final Excel file goes to project directory:
match (p:Patient)-[r:GENO]->(g:Concept) where r.interesting=2 return p.patient_id,
r.SIFT,
r.SplicingPredictionScore,
r.interesting,
r.cadd_score,
r.HTZinSLO,
r.PolyPhen2_modified,
r.MutationTaster,
r.GnomADHMZ,
r.ExACGeneralMAF,
r.UK10KAlleleCount,
r.MutationTaster_modified,
r.functional_impact,
r.variant_position,
r.GnomADAlleleCount,
r.PolyPhen2,
r.SIFT_modified,
r.ClinVar,
r.HMZinSLO,
g.entrez_gene_id,g.gene_symbol,g.exac_pLI,g.mis_z;
###

# Filtered and ranked (see WHERE and ORDER BY clauses):
match (p:Patient)-[r:GENO]->(g:Concept) 
where 
  r.interesting=2 and r.GnomADHMZ=0 and r.HMZinSLO=0 and r.HTZinSLO<3 and r.GnomADAlleleCount=0  
return p.patient_id,
r.SIFT,
r.SplicingPredictionScore,
r.interesting,
r.cadd_score,
r.HTZinSLO,
r.PolyPhen2_modified,
r.MutationTaster,
r.GnomADHMZ,
r.ExACGeneralMAF,
r.UK10KAlleleCount,
r.MutationTaster_modified,
r.functional_impact,
r.variant_position,
r.GnomADAlleleCount,
r.PolyPhen2,
r.SIFT_modified,
r.ClinVar,
r.HMZinSLO,
g.entrez_gene_id,g.gene_symbol,g.exac_pLI,g.mis_z
order by g.exac_pLI desc;
# Started streaming 77 records after 298 ms and completed after 299 ms.



###### VARIOUS QUERY EXAMPLES
# Query for filtering and ranking Phenotype - Genetype existing relations
# match (c1)<-[:PHENO_UMLS]-(p:Patient)-[r:GENO]->(g) where (r.HMZinSLO < 2) AND (r.GnomADHMZ < 10) with c1,p,r,g match (c1)-[r2]-(g) return c1,labels(c1),r,type(r),r2,type(r2),g,labels(g) order by r2.freq desc, r.functional_impact_num desc, r.GnomADAlleleCount asc, r.ExACGeneralMAF asc, r.HTZinSLO asc, r.UK10KAlleleCount asc, r.cadd_score desc, r.SIFT asc limit 20;

# Query for filtering and ranking Phenotype - Genetype existing relations - direct and indirect relations
# match (c1)<-[:PHENO_UMLS]-(p:Patient)-[r:GENO]->(g) where (r.HMZinSLO < 2) AND (r.GnomADHMZ < 10) with c1,p,r,g match (c1)-[r2]-(g) with c1,r,p,r2,g order by r2.freq desc, r.functional_impact_num desc, r.GnomADAlleleCount asc, r.ExACGeneralMAF asc, r.HTZinSLO asc, r.UK10KAlleleCount asc, r.cadd_score desc, r.SIFT asc limit 10 match (c1)<-[r3]-(c2)<-[r4]-(g) return c1,type(r3),r3.freq,c2,labels(c2),type(r4),r4.freq,g order by r3.freq+r4.freq desc limit 20;

# ... after a lot of exclusions of irrelevant concepts or relations
# match (c1)<-[:PHENO_UMLS]-(p:Patient {id:"PX1277"})-[r:GENO]->(g) where (r.HMZinSLO < 2) AND (r.GnomADHMZ < 10) with c1,p,r,g match (c1)-[r2]-(g) with c1,r,p,r2,g order by r2.freq desc, r.functional_impact_num desc, r.GnomADAlleleCount asc, r.ExACGeneralMAF asc, r.HTZinSLO asc, r.UK10KAlleleCount asc, r.cadd_score desc, r.SIFT asc limit 100 match (c1)<-[r3]-(c2)<-[r4:ISA|STIMULATES|INHIBITS|NEG_AFFECTS|CAUSES|ASSOCIATED_WITH|PREDISPOSES|AFFECTS]-(g) where (not (c2.cui starts with "C" AND "gngm" in labels(c2))) and not (c2.cui in ["C0035668","C0282641","C0015684","C0033684","C0242291","C0017337","C0012854","C0277785","C0007634","C0040300"]) and c2<>g and not (type(r3) in ["TREATS"]) return  distinct c1,type(r3),r3.freq,c2,labels(c2),type(r4),r4.freq,g order by r3.freq*r4.freq desc limit 200;

# ... similar as above, for visualization
# match (c1)<-[:PHENO_UMLS]-(p:Patient {id:"PX1277"})-[r:GENO]->(g) where (r.HMZinSLO < 2) AND (r.GnomADHMZ < 10) with c1,p,r,g match (c1)-[r2]-(g) with c1,r,p,r2,g order by r2.freq desc, r.functional_impact_num desc, r.GnomADAlleleCount asc, r.ExACGeneralMAF asc, r.HTZinSLO asc, r.UK10KAlleleCount asc, r.cadd_score desc, r.SIFT asc limit 100 match (c1)<-[r3]-(c2)<-[r4:ISA|STIMULATES|INHIBITS|NEG_AFFECTS|CAUSES|ASSOCIATED_WITH|PREDISPOSES|AFFECTS]-(g) where (not (c2.cui starts with "C" AND "gngm" in labels(c2))) and not (c2.cui in ["C0035668","C0282641","C0015684","C0033684","C0242291","C0017337","C0012854","C0277785","C0007634","C0040300"]) and c2<>g and not (type(r3) in ["TREATS"]) return  distinct c1,r3,c2,r4,g order by r3.freq*r4.freq desc limit 200;

# ... after GROUP BY uniq path c1,c2,g and for each uniq we make a sum of frequency of relations over all relations between c1 and c2, and between c2 and g
# match (c1)<-[:PHENO_UMLS]-(p:Patient {id:"PX1277"})-[r:GENO]->(g) where (r.HMZinSLO < 2) AND (r.GnomADHMZ < 10) with c1,p,r,g match (c1)-[r2]-(g) with c1,r,p,r2,g order by r2.freq desc, r.functional_impact_num desc, r.GnomADAlleleCount asc, r.ExACGeneralMAF asc, r.HTZinSLO asc, r.UK10KAlleleCount asc, r.cadd_score desc, r.SIFT asc limit 100 match (c1)<-[r3]-(c2)<-[r4:ISA|STIMULATES|INHIBITS|NEG_AFFECTS|CAUSES|ASSOCIATED_WITH|PREDISPOSES|AFFECTS]-(g) where (not (c2.cui starts with "C" AND "gngm" in labels(c2))) and not (c2.cui in ["C0035668","C0282641","C0015684","C0033684","C0242291","C0017337","C0012854","C0277785","C0007634","C0040300"]) and c2<>g and not (type(r3) in ["TREATS"]) return  c1,c2,g,sum(r3.freq) as r3_sum,sum(r4.freq) as r4_sum order by r3_sum*r4_sum desc limit 200;

match (c1)-[r:GENO]->(c2) return count(distinct c1),count(distinct r),count(distinct c2),count(*);
# 18.10.2018:
╒════════════════════╤═══════════════════╤════════════════════╤══════════╕
│"count(distinct c1)"│"count(distinct r)"│"count(distinct c2)"│"count(*)"│
╞════════════════════╪═══════════════════╪════════════════════╪══════════╡
│1205                │262132             │15235               │262132    │
└────────────────────┴───────────────────┴────────────────────┴──────────┘
# Earlier:
╒════════════════════╤═══════════════════╤════════════════════╤══════════╕
│"count(distinct c1)"│"count(distinct r)"│"count(distinct c2)"│"count(*)"│
╞════════════════════╪═══════════════════╪════════════════════╪══════════╡
│1205                │209229             │15294               │209229    │
└────────────────────┴───────────────────┴────────────────────┴──────────┘

#######################
# END Upload PatientVariants.tsv 02.03.2018, 18.10.2018
#######################

####################################
# Some more example queries:
####################################
# Collect the genotype (set of gngm concepts) and phenotype (set of HPO terms)
match (g:Concept:gngm)<-[:GENO]-(p:Patient)-[:PHENO]->(t:HPO) return p, t, g limit 250;
# same as above, for a particular patient and also 
#the relations are returned for visualisation/exploration
match (g:Concept:gngm)<-[pRg:GENO]-(p:Patient)-[pRt:PHENO]->(t:HPO) where p.id="PX1522" return g,pRg,p,pRt,t limit 250;

# Collect the genotype and phenotype for patients, for phenotype only existing 
# UMLS Semmed concept
match (c:Concept)<-[r1:PHENO_UMLS]-(p:Patient)-[r2:GENO]->(g:Concept:gngm) return p,r2,g,r1,c limit 250
# for a particular patient
match (g:Concept:gngm)<-[pRg:GENO]-(p:Patient)-[pRc:PHENO_UMLS]->(c:Concept) where p.id="PX1522" return g,pRg,p,pRc,c limit 250;

# For a particular patient, count distinct phenotypes and distinct genetypes
match (pheno:Concept)<-[r1:PHENO_UMLS]-(p:Patient {id: "PX1383"})-[r2:GENO]->(g:gngm) return count(distinct pheno),count(distinct p),count(distinct g);

# For a given patient, find the phenotype and genotype, then find concepts "o" of certain
# semantic types, but excluding too general "o" (in exception list), so that
# "o" concepts link genotype to phenotype through "o"
# Exception list should be expanded
# Ranking should be developed
match (c:Concept)<-[r1:PHENO_UMLS]-(p:Patient {id: "PX1383"})-[r2:GENO]->(g:Concept:gngm) with c,g order by g.cadd_score desc limit 100  match (c)<-[r1]-(o:Concept)<-[r2]-(g) where not (o.cui in ["C0035668","C0282641","C0015684","C0242291","C0017337","C0012854","C0277785"]) and ("gngm" in labels(o) or "aapp" in labels(o) or "biof" in labels(o) or "celf" in labels(o) or "comd" in labels(o) or "genf" in labels(o) or "moft" in labels(o) or "orgf" in labels(o) or "ortf" in labels(o) or "patf" in labels(o) or "phsf" in labels(o)) return c,labels(c),r1,type(r1),o,labels(o),r2,type(r2),g,labels(g) limit 200;

# Newer version of the above query: 7.02.2018
# it outputs the varians, too, and uses "not (g.cui starts with "C")" 
# to eliminate non-EtrezGene genes
match (c:Concept)<-[r3:PHENO_UMLS]-(p:Patient {id: "PX1383"})-[r4:GENO]->(g:Concept:gngm) where not(g.cui starts with "C") with c,p,r4,g order by g.cadd_score desc limit 1000  match (c)<-[r1]-(o:Concept)<-[r2]-(g)<-[r4]-(p) where not (o.cui in ["C0035668","C0282641","C0015684","C0242291","C0017337","C0012854","C0277785"]) and ("gngm" in labels(o) or "aapp" in labels(o) or "biof" in labels(o) or "celf" in labels(o) or "comd" in labels(o) or "genf" in labels(o) or "moft" in labels(o) or "orgf" in labels(o) or "ortf" in labels(o) or "patf" in labels(o) or "phsf" in labels(o)) return c,labels(c),r1,type(r1),o,labels(o),r2,type(r2),g,labels(g),r4,p.id limit 200;
####################################

#########################
# Not done yet for 18.10.2018
# 7.2.2018
# Deleting un-informative "gngm" (genes that are not really genes or are useless)
# Find the Top-10 gngm with highest pagerank and delete them together with all their relationships
#
match (g:gngm) return g.name,g.cui,labels(g) order by g.pagerank desc limit 10;
╒═════════════════╤══════════╤══════════════════════════════════════════════════════════════════════╕
│"g.name"         │"g.cui"   │"labels(g)"                                                           │
╞═════════════════╪══════════╪══════════════════════════════════════════════════════════════════════╡
│"Individual"     │"C0237401"│["humn","Concept","grup","popg","horm","gngm"]                        │
├─────────────────┼──────────┼──────────────────────────────────────────────────────────────────────┤
│"Family"         │"C0015576"│["humn","Concept","bacs","aapp","gngm","famg"]                        │
├─────────────────┼──────────┼──────────────────────────────────────────────────────────────────────┤
│"Proteins"       │"C0033684"│["Concept","orch","phsu","aapp","gngm","topp","bacs","chvs","chvf","hl│
│                 │          │ca","horm","bodm","chem"]                                             │
├─────────────────┼──────────┼──────────────────────────────────────────────────────────────────────┤
│"Genes"          │"C0017337"│["Concept","orch","phsu","aapp","gngm","topp","bacs","nnon","hlca","ho│
│                 │          │rm","bodm","chem"]                                                    │
├─────────────────┼──────────┼──────────────────────────────────────────────────────────────────────┤
│"DNA"            │"C0012854"│["hops","patf","phsu","lbpr","gngm","topp","fndg","tisu","carb","nnon"│
│                 │          │,"bodm","inch","mnob","chem","Concept","virs","aapp","celc","mbrt","ba│
│                 │          │cs","elii","hlca","imft"]                                             │
├─────────────────┼──────────┼──────────────────────────────────────────────────────────────────────┤
│"DNA Sequence"   │"C0162326"│["Concept","bacs","nnon","nusq","aapp","gngm"]                        │
├─────────────────┼──────────┼──────────────────────────────────────────────────────────────────────┤
│"Antibodies"     │"C0003241"│["Concept","bpoc","orch","phsu","aapp","gngm","lbpr","moft","bacs","ir│
│                 │          │da","chvf","hlca","imft","horm","bodm"]                               │
├─────────────────┼──────────┼──────────────────────────────────────────────────────────────────────┤
│"Enzymes"        │"C0014442"│["Concept","orch","phsu","aapp","gngm","enzy","topp","bacs","hlca","ho│
│                 │          │rm","bodm","chem"]                                                    │
├─────────────────┼──────────┼──────────────────────────────────────────────────────────────────────┤
│"sibling"        │"C0037047"│["humn","Concept","popg","gngm","famg"]                               │
├─────────────────┼──────────┼──────────────────────────────────────────────────────────────────────┤
│"Homologous Gene"│"C1334043"│["Concept","phsu","aapp","gngm","topp","bacs","nnon","hlca","horm","ge│
│                 │          │nf"]                                                                  │
└─────────────────┴──────────┴──────────────────────────────────────────────────────────────────────┘

match (g:gngm) with g order by g.pagerank desc limit 10
detach delete (g);


#$$$$$$$$$$$$$$$$$$$ Skipped 18.10.2018 $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
# but the data from the previous processing re-used
**************
* Loading of HPOtoUMLS

# HPO to UMLS terminological mapping:
# Transform from HP0000001 to HP:0000001
# in bash
# mitko@mitko-pc2 MINGW64 ~/Dropbox (MF Uni LJ)/prjs/NGS_LBD/Data_2018-04-06

sed -e 's/HP/HP:/g' HPOtoUMLS_new.txt >HPOtoUMLS_new_colon.txt

# The data before and now:
head -10 HPOtoUMLS_new*
# ==> HPOtoUMLS_new.txt <==
# HP0000001       C0023449
# HP0000001       C1961102
# HP0000003       C0345335

# ==> HPOtoUMLS_new_colon.txt <==
# HP:0000001      C0023449
# HP:0000001      C1961102
# HP:0000003      C0345335

# HPO to Entrez Gene associations (Phenotype to Genotype associations - direction not important)
# There were non-uniq combinations in this file because of the UMLS.cui as the last column
# We cut out the last column and made a uniq version to a new file which should be loaded now
# mitko@mitko-pc2 MINGW64 ~/Dropbox (MF Uni LJ)/prjs/NGS_LBD/Data_2018-03-27
cut -f 1,2,3,4 HPO_GeneID.tsv | wc -l
# 102660 lines before uniq

cut -f 1,2,3,4 HPO_GeneID.tsv | uniq | wc -l
# 94711 lines after uniq

# Create a new file with uniq lines
cut -f 1,2,3,4 HPO_GeneID.tsv | uniq > HPO_GeneID_uniq.tsv

# Count the lines in the uniq-ed file
cat HPO_GeneID_uniq.tsv | wc -l
# 94711

# A few lines from the uniq-ed file
head HPO_GeneID_uniq.tsv
# gene.symbol     entrez.gene.id  HPO.ID  HPO.term.name
# CHRM3   1131    HP:0001374      Congenital hip dislocation
# CHRM3   1131    HP:0001762      Talipes equinovarus
# CHRM3   1131    HP:0000072      Hydroureter

#$$$$$$$$$$$$$$$$$$$ END Skipped part on 18.10.2018 $$$$$$$$$$$$$$$$$$$$


# Load the Phenotype -- Genotype associations first
USING PERIODIC COMMIT 1000
load csv with headers from "file:///HPO_GeneID_uniq.tsv" as line FIELDTERMINATOR '\t' 
with line where not (line["entrez.gene.id"] is null or line["entrez.gene.id"]="NA")
MERGE (hpo:HPO {id: line["HPO.ID"], name: line["HPO.term.name"]})
MERGE (g:Concept {cui: line["entrez.gene.id"]})
ON CREATE SET g:gngm, g.cui=line["entrez.gene.id"], g.name=line["gene.symbol"], g.gene_symbol=line["gene.symbol"], g.entrez_gene_id=line["entrez.gene.id"], g.semmed=false
ON MATCH SET g:gngm, g.gene_symbol=line["gene.symbol"], g.entrez_gene_id=line["entrez.gene.id"]
CREATE (hpo)-[r:HPO_GENE]->(g);
# 18.10.2018: Added 4778 labels, created 4770 nodes, set 198974 properties, created 94710 relationships, completed after 4664 ms.
# 12.06.2018: Added 4775 labels, created 4766 nodes, set 198966 properties, created 94710 relationships, completed after 7752 ms.


# 18.10.2018, 14.06.2018
# I decided to LOAD CSV from the table OMIM_ALL_FREQUENCIES_diseases_to_genes_to_phenotypes.txt
# Three types of nodes and three types of relation can be loaded from this file.
#
# IMPORTANT: Must create the following constraint because it creates an INDEX for fast searching.
# Otherwise, the next LOAD CSV takes forever and did not finish. With the contraint it finished quite soon.
CREATE CONSTRAINT ON (omim:OMIM) ASSERT (omim.id) IS NODE KEY;
# 18.10.2018: Added 1 constraint, completed after 285 ms.
# 29.11.2019: Added 1 constraint, completed after 1158 ms. (on bt2)

USING PERIODIC COMMIT 1000
LOAD CSV with headers from "file:///OMIM_ALL_FREQUENCIES_diseases_to_genes_to_phenotypes.txt" as line FIELDTERMINATOR '\t' 
with line 
MERGE (omim:OMIM {id: line["disease.id"]})
MERGE (g:Concept {cui: line["entrez.gene.id"]})
	ON CREATE SET g:gngm, g.cui=line["entrez.gene.id"], g.name=line["gene.symbol"], g.gene_symbol=line["gene.symbol"], g.entrez_gene_id=line["entrez.gene.id"], g.semmed=false
	ON MATCH SET g:gngm, g.gene_symbol=line["gene.symbol"], g.entrez_gene_id=line["entrez.gene.id"]
MERGE (hpo:HPO {id: line["hpo.id"]})
	ON CREATE SET hpo.name=line["hpo.name"]
	ON MATCH SET hpo.name=line["hpo.name"]
MERGE (omim)-[r1:OMIM_GENE]-(g)
MERGE (hpo)-[r2:HPO_GENE]-(g)
MERGE (hpo)-[r3:HPO_OMIM]-(omim);
# 18.10.2018: Added 4718 labels, created 4716 nodes, set 230125 properties, created 84034 relationships, completed after 8570 ms.
# 14.06.2018: Added 4643 labels, created 4641 nodes, set 230050 properties, created 84034 relationships, completed after 22903 ms.
# 29.11.2019: Added 13451 labels, created 13311 nodes, set 593976 properties, created 286491 relationships, completed after 520846 ms.(on mitko-pc2)

# 29.11.2019, 18.10.2018, 15.06.2018
# The new LOAD CSV
USING PERIODIC COMMIT 1000
LOAD CSV with headers from "file:///HPOtoUMLS_extracted_from_obo.tsv" as line FIELDTERMINATOR '\t' 
 with line
 MERGE (hpo:HPO {id: line["hpo.id"]})
 	ON CREATE set hpo.name = line["hpo.name"]
 	ON MATCH set hpo.name = line["hpo.name"]
 MERGE (c:Concept {cui: line["umls.cui"]})
 	ON CREATE SET c.semmed=false
 CREATE (hpo)-[r:HPO_UMLS]->(c);
# 18.10.2018: Added 14924 labels, created 14924 nodes, set 37626 properties, created 13186 relationships, completed after 1349 ms. 
# 15.06.2018: Added 11284 labels, created 11284 nodes, set 31285 properties, created 13186 relationships, completed after 8632 ms.
# 29.11.2019: Added 14015 labels, created 14015 nodes, set 36559 properties, created 13057 relationships, completed after 1075 ms.


# 18.10.2018, 27.06.2018
# Load the OMIM to UMLS terminological mapping
USING PERIODIC COMMIT 1000
LOAD CSV with headers from "file:///OMIM_UMLS.tsv" as line FIELDTERMINATOR '\t' 
 with line
 MERGE (omim:OMIM {id: line["OMIM.ID"]})
 MERGE (c:Concept {cui: line["UMLS.ID"]})
 	ON CREATE SET c.semmed=false
 MERGE (omim)-[r:OMIM_UMLS]-(c);
 # 18.10.2018: Added 1019 labels, created 1019 nodes, set 2037 properties, created 1986 relationships, completed after 317 ms
 # 27.06.2018: Added 1005 labels, created 1005 nodes, set 2009 properties, created 1986 relationships, completed after 2304 ms.
 # 06.12.2019 Added 1046 labels, created 1046 nodes, set 2067 properties, created 1986 relationships, completed after 752 ms.

