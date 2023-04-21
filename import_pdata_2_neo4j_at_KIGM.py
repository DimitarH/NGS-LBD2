#!/usr/bin/env python
# coding: utf-8

# In[1]:


import os
import re
import sys
import json
import gzip
import math
import mariadb
import numpy as np
import pandas as pd
from tqdm import tqdm
from os.path import exists

from neo4j import GraphDatabase

sys.version_info
# sys.version_info(major=3, minor=6, micro=5, releaselevel='final', serial=0)

# Use in case pip3 fails behind proxy
# https_proxy=$http_proxy

pd.set_option('display.max_columns', None)

class Neo4jConnection:
    
    def __init__(self, uri, user, pwd):
        self.__uri = uri
        self.__user = user
        self.__pwd = pwd
        self.__driver = None
        try:
            self.__driver = GraphDatabase.driver(self.__uri, auth=(self.__user, self.__pwd))
        except Exception as e:
            print("Failed to create the driver:", e)
        
    def close(self):
        if self.__driver is not None:
            self.__driver.close()
        
    def query(self, query, db=None):
        assert self.__driver is not None, "Driver not initialized!"
        session = None
        response = None
        try: 
            session = self.__driver.session(database=db) if db is not None else self.__driver.session() 
            response = list(session.run(query))
        except Exception as e:
            print("Query failed:", e)
        finally: 
            if session is not None:
                session.close()
        return response
    
def connectToCMGdb():
    # Connect to MariaDB Platform
    try:
        conn = mariadb.connect(
            user="",
            password="",
            host="",
            port=,
            database=""
        )
    except mariadb.Error as e:
        print(f"Error connecting to MariaDB Platform: {e}")
        sys.exit(1)

    print("[ PASS ] MariaDB connection succesfull ...")
    return conn

def loadSelectedCMGdbTables(tables = "patient"):
    # Connect to MariaDB Platform
    conn = connectToCMGdb()
    
    # Get Cursor
    # cur = conn.cursor()
        
    try:
        df = {}
        for table in tables:
            df[table] = pd.read_sql("SELECT * from " + table, conn)
    except mariadb.Error as e:
        print(f"Error: {e}")
    
    conn.close()
    
    return df

def loadPatientPhenotypes(CMGdb, patients):
    # find average shortest path between patient HPO terms and HPO terms associated with disorders
    
    patients = CMGdb['patient'][CMGdb['patient']['patient_identifier'].isin(patients)]
    patient_hpo = CMGdb['patient_hpo'][CMGdb['patient_hpo']['patient_id'].isin(patients['id'])]
    
    patient_hpo.loc[:, 'pid'] = patient_hpo.loc[:, 'patient_id']
    patient_hpo.loc[:, 'hpo'] = patient_hpo.loc[:, 'hpo_id']
    patient_hpo.loc[:, 'english_name'] = patient_hpo.loc[:, 'hpo_id']
    
    di_pat = patients[['id','patient_identifier']].set_index('id').to_dict()
    di_hpo_id = CMGdb['HPO'].loc[:,['id', 'hpo']].set_index('id').to_dict()
    di_hpo_name = CMGdb['HPO'].loc[:,['id', 'english_name']].set_index('id').to_dict()
    
    patient_hpo = patient_hpo.replace({"patient_id": di_pat['patient_identifier']})
    patient_hpo = patient_hpo.replace({"hpo": di_hpo_id['hpo']})
    patient_hpo = patient_hpo.replace({"english_name": di_hpo_name['english_name']})
    
    return patient_hpo

def convertSqlIDs2PX(CMGdb, pids):
    pids = pd.DataFrame(pids)
    pids.columns = ['id']
    patients = pd.merge(pids, CMGdb['patient'][['id', 'patient_identifier']], on='id')['patient_identifier']
    return patients

def convertPX2SqlIDs(CMGdb, patients):
    if not isinstance(patients, list): patients = [patients]
    IDs = CMGdb['patient']['id'][CMGdb['patient']['patient_identifier'].isin(patients)].tolist()
    return IDs

def getPatientPathVariants(CMGdb, patient):
    pid = convertPX2SqlIDs(CMGdb, patients = patient)[0]
    gene = CMGdb['patient_path_variants']['genesymbol'][CMGdb['patient_path_variants']['patient_id'] == pid].tolist()
    return gene

def getPatientRareVariants(CMGdb, patient):
    pid = convertPX2SqlIDs(CMGdb, patients = patient)[0]
    genes = CMGdb['patient_variants_ori'][((CMGdb['patient_variants_ori']['patient_id'] == pid).tolist())]
    genes = genes[['RARE_FUNCTIONAL' in x for x in genes['functional_tags']]]
    genes = genes[genes['quality_flags'] == '']['genesymbol'].tolist()
    return genes

def getPatientPanelFilteredVariants(CMGdb, patient):
    pid = convertPX2SqlIDs(CMGdb, patients = patient)[0]
    genes = CMGdb['patient_variants_ori'][((CMGdb['patient_variants_ori']['patient_id'] == pid).tolist())]
    genes = genes[['PANEL_F' in x for x in genes['functional_tags']]]
    genes = genes[genes['quality_flags'] == '']['genesymbol'].tolist()
    return genes

def getNumberOfGenesInPatientPanels(CMGdb, patients):
    genes_per_patient = {}
    for patient in tqdm(patients):
        panels = list(set(CMGdb['patient_panel']['panel_id'][CMGdb['patient_panel']['patient_id']==convertPX2SqlIDs(CMGdb, patient)[0]]))
        panels = [x for x in panels if ~np.isnan(x)]
        genes =  list(set(CMGdb['panel'].query('id in @panels')['genes']))
        gene_num = len(list(set("".join(genes).split(","))))
        genes_per_patient[patient] = gene_num
        # print(f'{patient} : {gene_num}')
    return genes_per_patient



# Load CMGdb
print('[ PROCESSING ] Loading CMG database')
CMGdb = loadSelectedCMGdbTables(tables = ["assoc_patient_outcome", "outcome", "patient", "patient_panel", "panel", "HPO", "patient_hpo", "patient_variants", "report_class", "variants"])
# CMGdb = loadSelectedCMGdbTables(tables = ["assoc_patient_outcome", "outcome", "patient", "patient_panel", "panel", "HPO", "patient_hpo", "report_class"])
mv_podatki = pd.read_excel('/mnt/SKUPNA_MAPA/SKUPNO/OSEBNE_MAPE/GABER_BERGANT/ARTICLES/RESEARCH/2022_CADA_Lyrical/MatejaVinkšel_podatki.xls', sheet_name=0)
mv_positive_patients = mv_podatki[mv_podatki['rezultat_gaber'] == 'POZ']['PatientID']
mv_negative_patients = mv_podatki[mv_podatki['rezultat_gaber'] == 'NEG']['PatientID']

# ADD QC PATIENTS, DATA REDACTED IN GITHUB FILE
qc = {}

positive_outcomes = [1, 2, 3, 6, 8, 9, 17, 19]
positive_patients_ids = CMGdb['assoc_patient_outcome'].query('outcome_id in @positive_outcomes')['patient_id']

positive_patients_ids = list(set(positive_patients_ids) | set(convertPX2SqlIDs(CMGdb, mv_positive_patients.tolist())))

CMGdb['positive_outcome'] = CMGdb['patient'].query('id in @positive_patients_ids')
CMGdb['positive_outcome'] = CMGdb['positive_outcome'][['patient_identifier', 'referral_diagnosis', 'hpo', 'panel_genes']]
patient_hpos = loadPatientPhenotypes(CMGdb, CMGdb['positive_outcome']['patient_identifier'])
for patient in tqdm(list(set(patient_hpos['patient_id']))):
    CMGdb['positive_outcome']['hpo'][CMGdb['positive_outcome']['patient_identifier']==patient] = ", ".join(patient_hpos['english_name'][patient_hpos['patient_id']==patient])
CMGdb['positive_outcome']['panel_genes'] = CMGdb['positive_outcome']['panel_genes'].replace([None],"0")
CMGdb['positive_outcome']['panel_genes'] = list(map(lambda x: len(x.split(',')), list(CMGdb['positive_outcome']['panel_genes'])))
CMGdb['patient_panel']['id'] = CMGdb['patient_panel']['panel_id']
panels = pd.merge(CMGdb['patient_panel'], CMGdb['panel'], on='id')[['patient_id', 'english_name']]
panels = panels.sort_values(['patient_id'], axis=0)
panels['patient_id'] = list(convertSqlIDs2PX(CMGdb, panels['patient_id']))
CMGdb['positive_outcome']['panels'] = None
for patient in tqdm(list(set(panels['patient_id']))):
    CMGdb['positive_outcome']['panels'][CMGdb['positive_outcome']['patient_identifier']==patient] = ", ".join(panels['english_name'][panels['patient_id']==patient])

negative_patients_ids = CMGdb['assoc_patient_outcome'].query('outcome_id not in @positive_outcomes')['patient_id']
negative_patients_ids = list(set(negative_patients_ids) | set(convertPX2SqlIDs(CMGdb, mv_negative_patients.tolist())))
negative_patients_ids = list(set(negative_patients_ids) | set(convertPX2SqlIDs(CMGdb, list(qc))))
negative_patients = convertSqlIDs2PX(CMGdb, negative_patients_ids)



CMGdb['positive_outcome']['reported_variants']=''
for patient in tqdm(CMGdb['positive_outcome']['patient_identifier']):
    
    patient_id = convertPX2SqlIDs(CMGdb, patient)[0]
    patient_xlsx_path = "".join(['/mnt/EXOMES/',patient,'/interpretation/',patient,'_FinalResults_interpreted.xlsx'])
    reported_variants = ",".join(CMGdb["patient_variants"].query('patient_id==@patient_id & (report_class_id==0 | report_class_id == 1)')['genesymbol'].tolist())

    if reported_variants != '':
        CMGdb['positive_outcome'].loc[CMGdb['positive_outcome']['patient_identifier']==patient, 'reported_variants'] = reported_variants
    elif exists(patient_xlsx_path):
        patient_xlsx = pd.read_excel(os.path.join(patient_xlsx_path), engine='openpyxl', sheet_name=None)
        if 'Panel_FILTERED' in patient_xlsx.keys():
            reported_variants_xlsx = patient_xlsx['Panel_FILTERED'].query('(PathogenicityClass==4 | PathogenicityClass==5) & Report!="C"')['Gene.symbol'].tolist()
            # Check for math.nan
            if len(reported_variants_xlsx) > 0:
                if isinstance(reported_variants_xlsx[0], float):
                    reported_variants_xlsx = patient_xlsx['Panel_FILTERED'].query('(PathogenicityClass==4 | PathogenicityClass==5) & Report!="C"')['Gene.name..snpEff.'].tolist()
            reported_variants_xlsx = [x for x in reported_variants_xlsx if str(x) != 'nan']
            reported_variants_xlsx = ",".join(reported_variants_xlsx)
            CMGdb['positive_outcome'].loc[CMGdb['positive_outcome']['patient_identifier']==patient, 'reported_variants'] = reported_variants_xlsx
    else:
        CMGdb['positive_outcome'].loc[CMGdb['positive_outcome']['patient_identifier']==patient, 'reported_variants'] = 'none'



len(negative_patients)

CMGdb['positive_outcome']['reported_variants'].loc[CMGdb['positive_outcome']['reported_variants']==""] = "none"

# for i in tqdm(CMGdb['positive_outcome']['reported_variants'].index.values.tolist()):
#     CMGdb['positive_outcome']['reported_variants'].loc[i] == "".join(list(set(CMGdb['positive_outcome']['reported_variants'][i].split(","))))

CMGdb['positive_outcome']['reported_variants'] = ["".join(list(set(x.split(",")))) for x in CMGdb['positive_outcome']['reported_variants']]

# CMGdb['positive_outcome'].to_csv(path_or_buf='/home/gbergant/Downloads/results.csv', sep=';')



# Create patient_variants_filtered df with all variants for import

CMGdb['patient_variants_filtered'] = CMGdb["patient_variants"][CMGdb["patient_variants"]['functional_tags'].str.contains('LOF_CANDIDATE|RARE_LOF_CANDIDATE|MISSENSE_CANDIDATE|ULTRARARE_CANDIDATE|ULTRARARE_HOM_CANDIDATE')]
CMGdb['patient_variants_filtered'] = CMGdb["patient_variants_filtered"][CMGdb["patient_variants_filtered"]['quality_flags']==""]

patients = list(set(CMGdb['patient']['patient_identifier']))

CMGdb['patient_variants_filtered'] = CMGdb['patient_variants_filtered'].sort_values(['patient_id'], axis=0)
CMGdb['patient_variants_filtered']['px'] = convertSqlIDs2PX(CMGdb, CMGdb['patient_variants_filtered']['patient_id'].tolist()).tolist()
len(CMGdb['patient_variants_filtered'])


CMGdb['patient_variants_filtered_negative_patients'] = CMGdb['patient_variants_filtered'].query('px in @negative_patients')
len(CMGdb['patient_variants_filtered_negative_patients'])


# In[7]:


# Perform qc on qc patients

for patient in qc.keys():
    a = CMGdb['patient_variants_filtered'][CMGdb['patient_variants_filtered']['patient_id'] == convertPX2SqlIDs(CMGdb, [patient])[0]]
    b = a[a['genesymbol'] == qc[patient]]
    c = b[b['quality_flags'] == '']
    print(patient)
    print(c['genesymbol'])


# In[9]:


# Unique functional tags in database
# set(",".join(CMGdb["patient_variants"]['functional_tags']).split(","))

# Unique patients for import
len(set(CMGdb['patient_variants_filtered']['patient_id']))


# In[10]:


# Variants for import
len(CMGdb['patient_variants_filtered'])


# In[11]:


# Variants per patient for import
len(CMGdb['patient_variants_filtered']) / len(set(CMGdb['patient_variants_filtered']['patient_id']))


# In[13]:


# Create phenotypes for import
phenotypes = loadPatientPhenotypes(CMGdb, patients)[['patient_id', 'hpo', 'english_name']]
phenotypes = phenotypes[phenotypes['hpo'] != "NONE"]
phenotypes = phenotypes[phenotypes['hpo'] != ""]
hpo2umls = pd.read_csv('/mnt/SKUPNA_MAPA/SKUPNO/OSEBNE_MAPE/GABER_BERGANT/RESOURCES/HPO2UMLS.txt', sep='\t')
phenotypes_mapped = pd.merge(phenotypes, hpo2umls, on='hpo')

phenotypes_without_umls = list(np.setdiff1d(phenotypes['hpo'],phenotypes_mapped['hpo']))
phenotypes_without_umls_df = phenotypes.query('hpo in @phenotypes_without_umls')

phenotypes_final = pd.concat([phenotypes_mapped, phenotypes_without_umls_df], axis=0, ignore_index=True) 

phenotypes_import = phenotypes_final.to_dict(orient='records')

phenotypes_final['umls'] = phenotypes_final['umls'].fillna('NaN')

# Number of phenotypes in patients and not in phenotypes_input
len(list(np.setdiff1d(phenotypes['hpo'],phenotypes_final['hpo'])))


# In[14]:


# Create genotypes for import
CMGdb['patient_variants_filtered']['id'] = CMGdb['patient_variants_filtered']['variants_id']
genotypes = pd.merge(CMGdb['patient_variants_filtered'], CMGdb['variants'], on='id', how='left')
genotypes = genotypes[['px', 'variant_unique_id', 'chr', 'pos', 'ref', 'alt', 'genesymbol_x', 'genotype', 'transcript', 'transcriptpos', 'protein_change', 'impact', 'mutation_type', 'functional_tags_x', 'gnomad_allele_count_y', 'gnomad_hom',  'gnomad_exomes_allele_count_x', 'slo_het', 'slo_hom', 'slo_hemi', 'sift', 'polyphen2', 'mutationtaster', 'metasvm', 'interpro_domain', 'cadd', 'revel', 'gerp', 'ada_score', 'rf_score', 'spliceai', 'hpo_annotations', 'omim_annotations', 'disease_category', 'age', 'dbsnp', 'clinvar_id', 'clinvar_classification', 'clinvar_conflicts', 'clinvar_disease', 'clinsig', 'acmg', 'inheritance', 'pli', 'oe_mis', 'p_rec']]
genotypes_import = genotypes.to_dict(orient='records')
len(genotypes)


# In[15]:


patients = list(set(genotypes['px']) | set(phenotypes_final['patient_id']))


# In[16]:


len(patients)


# In[175]:

# ADD Neo4j credentials, data redacted in github file
conn = Neo4jConnection(uri="", user="", pwd="")


# In[69]:


# UPLOAD DATA TO NEO4J, PART 1

for index, line in tqdm(phenotypes_final_noNaN.iterrows()):
    # MERGE (charlie {name: 'Charlie Sheen', age: 10})
    # MERGE (michael:Person {name: 'Michael Douglas'}) RETURN michael.name, michael.bornIn
    query_strings = {
        'create_patient_nodes': "MERGE (patient:PATIENT {id: '"+line['patient_id']+"'});",
        'create_phenotype_nodes': "MERGE (phenotype:dsyn {cui: '"+line['umls']+"'}) ON MATCH SET phenotype.hpo = '"+line['hpo']+"', phenotype.english_name = '"+line['english_name']+"';",
        'create_PHENO_relationship': "MATCH (patient:PATIENT {id: '"+line['patient_id']+"'}), (phenotype:dsyn {cui: '"+line['umls']+"'}) MERGE (patient)-[r:PHENO]-(phenotype);"
                    }
    # MERGE (phenotype:hpo {id: '"+line['hpo']+"', english_name: '"+line['english_name']+"', umls: '"+line['umls']+"'})
    # print(query_strings)
    for key in query_strings:
        # print(query_strings[key])
        conn.query(query_strings[key], db='semmed43cord19')


# In[21]:


for column in CMGdb['patient_variants_filtered']:
    CMGdb['patient_variants_filtered'][column] = CMGdb['patient_variants_filtered'][column].fillna('NaN')


# In[124]:


# CMGdb['patient_variants_filtered']['functional_tags']
# CMGdb['patient_variants_filtered'].query('functional_tags == ".*LOF.*"')
CMGdb['patient_variants_filtered']['functional_impact'] = "MODERATE"
# CMGdb['patient_variants_filtered'][CMGdb['patient_variants_filtered']['functional_tags'].str.contains("LOF")]['functional_impact']
for index, line in CMGdb['patient_variants_filtered'].iterrows():
    # print (CMGdb['patient_variants_filtered'].loc[[index]])
    if "LOF" in line['functional_tags']:
        CMGdb['patient_variants_filtered']['functional_impact'].loc[[index]] = "HIGH"


# In[125]:


len(CMGdb['patient_variants_filtered'][CMGdb['patient_variants_filtered']['functional_impact'] == "HIGH"])


# In[135]:


CMGdb['variants']['variants_id'] = CMGdb['variants']['id']
CMGdb['patient_variants_filtered2'] = pd.merge(CMGdb['patient_variants_filtered'], CMGdb['variants'], on='variants_id')


# In[ ]:


# UPLOAD DATA TO NEO4J, PART 2

for index, line in tqdm(CMGdb['patient_variants_filtered2'].iterrows()):
    # print(line)
    query_string = "MATCH (g:gngm {name: '"+line['genesymbol_x']+"'}), (p:PATIENT {id: '"+line['px']+"'}) MERGE (g)-[r:GENO]-(p) ON CREATE SET r.genotype = '"+str(line['genotype'])+"', r.genesymbol = '"+str(line['genesymbol_x'])+"', r.GnomADAlleleCount = '"+str(line['gnomad_allele_count_x'])+"', r.GnomADHMZ = '0', r.functional_impact = '"+str(line['impact'])+"', r.variant_position = '"+str(line['chr'])+"-"+str(int(line['pos']))+"-"+str(line['ref'])+"-"+str(line['alt'])+"', r.ClinVar = '"+str(line['clinvar_classification'])+"';"
    try:
        conn.query(query_string, db='semmed43cord19')
    except:
        print(query_string)
        raise Exception("[ ERROR ]")
    
names = """

r.SIFT, X
r.SplicingPredictionScore, X
r.interesting, X
r.cadd_score, X
r.HTZinSLO, X
r.PolyPhen2_modified, X
r.MutationTaster, X
r.GnomADHMZ, X
r.ExACGeneralMAF, X
r.UK10KAlleleCount, X
r.MutationTaster_modified, X
r.functional_impact,
r.variant_position,
r.GnomADAlleleCount,
r.PolyPhen2, X
r.SIFT_modified, X
r.ClinVar,
r.HMZinSLO

"""


# In[ ]:


### END



### UNUSED CODE

query_string = 'MATCH (n:gngm) RETURN n.name'
query_results = conn.query(query_string, db='semmed43cord19')
genes_in_db = pd.DataFrame([dict(record) for record in query_results])

gene_names = pd.read_csv('/mnt/SKUPNA_MAPA/SKUPNO/OSEBNE_MAPE/GABER_BERGANT/RESOURCES/gene_names.tsv', sep='\t')
gene_names = gene_names.replace(r'^\s*$', "NaN", regex=True)

gene_names['Entrez.Gene.ID(supplied.by.NCBI)'] = gene_names['Entrez.Gene.ID(supplied.by.NCBI)'].fillna(int(0))
gene_names['Ensembl.Gene.ID'] = gene_names['Ensembl.Gene.ID'].fillna('NaN')
gene_names['OMIM.ID(supplied.by.OMIM)'] = gene_names['OMIM.ID(supplied.by.OMIM)'].fillna(int(0))

genes = list(set(CMGdb['patient_variants_filtered']['genesymbol']))

query_string = 'MATCH (n:gngm) RETURN n.name'
query_results = conn.query(query_string, db='semmed43cord19')
genes_in_db = pd.DataFrame([dict(record) for record in query_results])

genes = list(set(genes) - set(genes_in_db["n.name"].tolist()))
len(genes)
for gene in tqdm(genes):
    if gene is None:
        continue
    
    entrez_id = gene_names[gene_names['Approved.Symbol'] == gene]['Entrez.Gene.ID(supplied.by.NCBI)']
    ensembl_id = gene_names[gene_names['Approved.Symbol'] == gene]['Ensembl.Gene.ID']
    omim_id = gene_names[gene_names['Approved.Symbol'] == gene]['OMIM.ID(supplied.by.OMIM)']
    
    if len(entrez_id) > 0 and not entrez_id.values[0]==0:
        entrez_id=str(int(entrez_id.values[0]))
    else:
        entrez_id="NaN"
    if len(ensembl_id) > 0:
        ensembl_id=str(ensembl_id.values[0])
    else:
        ensembl_id="NaN"
    if len(omim_id) > 0 and not omim_id.values[0]==0:
        omim_id=str(omim_id.values[0])
    else:
        omim_id="NaN"
    
    query_string = "MERGE (g:gngm {name: '"+gene+"', entrez_id: '"+entrez_id+"', ensembl_id: '"+ensembl_id+"', omim_id: '"+omim_id+"'})"
    conn.query(query_string, db='semmed43cord19')

