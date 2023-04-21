MATCH p=(drug:Concept)-[r1:INHIBITS|DISRUPTS|INTERACTS_WITH]->(c2)-[r2:CAUSES|ASSOCIATED_WITH|PREDISPOSES|AUGMENTS|AFFECTS]->(covid:Concept)
where drug.cui in ["C0011777"] and covid.cui in ["C5203670","C5203676","C5203671"] 
RETURN drug,r1,c2,r2,covid order by (r1.freq+r2.freq) desc limit 20;

MATCH p=(drug:Concept)-[r1:INHIBITS|DISRUPTS|INTERACTS_WITH]->(c2)-[r2:CAUSES|ASSOCIATED_WITH|PREDISPOSES|AUGMENTS|AFFECTS]->(covid:Concept)
where drug.cui in ["C0011777"] and covid.cui in ["C5203670","C5203676","C5203671"] 
WITH drug,r1,c2,r2,covid order by (r1.freq+r2.freq) desc
match (c:Citation)<-[r_in:IS_IN]-(s:Sentence)<-[r_extr:Extracted_From]-(i:Instance)-[r_sub:Inst_Subject]->(drug:Concept),
      (i)-[r_obj:Inst_Object]->(c2:Concept)
return c,s,drug,r1,c2,r2,covid limit 20;

MATCH p=(drug:Concept)-[r1:INHIBITS|DISRUPTS|INTERACTS_WITH]->(c2)-[r2:CAUSES|ASSOCIATED_WITH|PREDISPOSES|AUGMENTS|AFFECTS]->(covid:Concept)
where drug.cui in ["C0011777"] and covid.cui in ["C5203670","C5203676","C5203671"] 
WITH drug,r1,c2,r2,covid order by (r1.freq+r2.freq) desc limit 50
match (c:Citation)<-[r_in:IS_IN]-(s:Sentence)<-[r_extr:Extracted_From]-(i:Instance)-[r_sub:Inst_Subject]->(drug:Concept),
      (i)-[r_obj:Inst_Object]->(c2:Concept)
return c.pmid,s.sentence,drug.cui,drug.name,type(r1),c2.cui,c2.name,type(r2),covid.cui,covid.name limit 20;

// For given (input) drug.cui:
//      For each (drug)-[r1]->(c2), find the PMID in sentences c_xy.pmid,s_xy.sentence and put them in an array
//      For each (c2)-[r2]->(covid), find the PMID in sentences c_yz.pmid,s_yz.sentence and put them in an array
// Return a structure: [{pmid: c_xy.pmid, sentence: s_xy.sentence}],drug.cui,drug.name,type(r1),c2.cui,c2.name,type(r2),covid.cui,covid.name,
//       [{pmid: c_yz.pmid, sentence: s_yz.sentence}]
MATCH p=(drug:Concept)-[r1:INHIBITS|DISRUPTS|INTERACTS_WITH]->(c2)-[r2:CAUSES|ASSOCIATED_WITH|PREDISPOSES|AUGMENTS|AFFECTS]->(covid:Concept)
where drug.cui in ["C0011777"] and covid.cui in ["C5203670","C5203676","C5203671"] 
WITH drug,r1,c2,r2,covid order by (r1.freq+r2.freq) desc limit 50
match (c_xy:Citation)<-[r_in_xy:IS_IN]-(s_xy:Sentence)<-[r_extr_xy:Extracted_From]-(i_xy:Instance)-[r_sub_x:Inst_Subject]->(drug:Concept),
      (i_xy)-[r_obj_y:Inst_Object]->(c2:Concept),
      (c_yz:Citation)<-[r_in_yz:IS_IN]-(s_yz:Sentence)<-[r_extr_yz:Extracted_From]-(i_yz:Instance)-[r_sub_y:Inst_Subject]->(c2:Concept),
      (i_yz)-[r_obj_z:Inst_Object]->(covid:Concept)
return c_xy.pmid,s_xy.sentence,drug.cui,drug.name,type(r1),c2.cui,c2.name,type(r2),covid.cui,covid.name,
       c_yz.pmid,s_yz.sentence limit 20;

//By Dimitar: For each (drug)-[r1]->(c2) finds 3 instances,sentences,citations
MATCH (drug:Concept)-[r1:INHIBITS|DISRUPTS|INTERACTS_WITH]->(c2)-[r2:CAUSES|ASSOCIATED_WITH|PREDISPOSES|AUGMENTS|AFFECTS]->(covid:Concept)
where drug.cui in ["C0011777"] and covid.cui in ["C5203670","C5203676","C5203671"] 
WITH drug,r1,c2,r2,covid order by (r1.freq+r2.freq) desc limit 20
CALL {
    WITH drug,r1,c2
    match (c_xy:Citation)<-[r_in_xy:IS_IN]-(s_xy:Sentence)<-[r_extr_xy:Extracted_From]-(i_xy:Instance)-[r_sub_x:Inst_Subject]->(drug:Concept),
      (i_xy)-[r_obj_y:Inst_Object]->(c2:Concept)
    RETURN c_xy, s_xy
    LIMIT 3
}
RETURN drug.cui,drug.name,type(r1),c2.cui,c2.name,c_xy.pmid,c_xy.pyear,s_xy.sentence; 

//By Dimitar: For each (drug)-[r1]->(c2)-[r2]->(covid) finds 3 instances,sentences,citations. Returns collections.
MATCH (drug:Concept)-[r1:INHIBITS|DISRUPTS|INTERACTS_WITH]->(c2)-[r2:CAUSES|ASSOCIATED_WITH|PREDISPOSES|AUGMENTS|AFFECTS]->(covid:Concept)
where drug.cui in ["C0011777"] and covid.cui in ["C5203670","C5203676","C5203671"] 
WITH drug,r1,c2,r2,covid order by (r1.freq+r2.freq) desc limit 20
CALL {
    WITH drug,r1,c2
    match (c_xy:Citation)<-[r_in_xy:IS_IN]-(s_xy:Sentence)<-[r_extr_xy:Extracted_From]-(i_xy:Instance)-[r_sub_x:Inst_Subject]->(drug:Concept),
      (i_xy)-[r_obj_y:Inst_Object]->(c2:Concept)

    WITH c_xy, s_xy
    LIMIT 3
    RETURN collect("PMID:"+c_xy.pmid+"-"+c_xy.pyear+": "+s_xy.sentence) as sent_xy
}
CALL {
    WITH c2,r2,covid
    match (c_yz:Citation)<-[r_in_yz:IS_IN]-(s_yz:Sentence)<-[r_extr_yz:Extracted_From]-(i_yz:Instance)-[r_sub_y:Inst_Subject]->(c2:Concept),
      (i_yz)-[r_obj_z:Inst_Object]->(covid:Concept)
    WITH c_yz, s_yz
    LIMIT 3
    RETURN collect("PMID:"+c_yz.pmid+"-"+c_yz.pyear+": "+s_yz.sentence) as sent_yz
}
RETURN sent_xy,sent_yz,drug.cui+":"+drug.name+"-"+type(r1)+"->"+c2.cui+":"+c2.name+"-"+type(r2)+"->"+covid.cui+":"+covid.name as Drug->Y->Covid;

MATCH (drug:Concept)-[r1:INHIBITS|DISRUPTS|INTERACTS_WITH]->(c2)-[r2:CAUSES|ASSOCIATED_WITH|PREDISPOSES|AUGMENTS|AFFECTS]->(covid:Concept)
where drug.cui in ["C0011777"] and covid.cui in ["C5203670","C5203676","C5203671"] 
WITH drug,r1,c2,r2,covid order by (r1.freq+r2.freq) desc limit 50
CALL {
    WITH drug,r1,c2
    match (c_xy:Citation)<-[r_in_xy:IS_IN]-(s_xy:Sentence)<-[r_extr_xy:Extracted_From]-(i_xy:Instance)-[r_sub_x:Inst_Subject]->(drug:Concept),
      (i_xy)-[r_obj_y:Inst_Object]->(c2:Concept)

    WITH c_xy, s_xy
    LIMIT 3
    RETURN collect("PMID:"+c_xy.pmid+"-"+c_xy.pyear+": "+s_xy.sentence) as sent_xy
}
CALL {
    WITH c2,r2,covid
    match (c_yz:Citation)<-[r_in_yz:IS_IN]-(s_yz:Sentence)<-[r_extr_yz:Extracted_From]-(i_yz:Instance)-[r_sub_y:Inst_Subject]->(c2:Concept),
      (i_yz)-[r_obj_z:Inst_Object]->(covid:Concept)
    WITH c_yz, s_yz
    LIMIT 3
    RETURN collect("PMID:"+c_yz.pmid+"-"+c_yz.pyear+": "+s_yz.sentence) as sent_yz
}
RETURN sent_xy,drug.cui+":"+drug.name+"-"+type(r1)+"-> "+c2.cui+":"+c2.name+"-"+type(r2)+"-> "+covid.cui+":"+covid.name as Drug_Y_Covid,sent_yz;

// For each path from Dexamethasone (drug) through concepts c2 to COVID-19
// show a collection of sentences for Dexamethasone-r->c2 and
// a collection of sentences for c2->COVID-19
// This works correctly, but is quite slow. Any ideas for optimization?
MATCH (drug:Concept)-[r1:INHIBITS|DISRUPTS|INTERACTS_WITH]->(c2)-[r2:CAUSES|ASSOCIATED_WITH|PREDISPOSES|AUGMENTS|AFFECTS]->(covid:Concept)
where drug.cui in ["C0011777"] and covid.cui in ["C5203670","C5203676","C5203671"] 
WITH drug,r1,c2,r2,covid order by (r1.freq+r2.freq) desc limit 20
CALL {
    WITH drug,r1,c2
    match (c_xy:Citation)<-[r_in_xy:IS_IN]-(s_xy:Sentence)<-[r_extr_xy:Extracted_From]-(i_xy:Instance {predicate: type(r1)})-[r_sub_x:Inst_Subject]->(drug:Concept),
      (i_xy)-[r_obj_y:Inst_Object]->(c2:Concept)
    WITH c_xy, s_xy
    LIMIT 3
    RETURN collect("PMID:"+c_xy.pmid+"-"+c_xy.pyear+": "+s_xy.sentence) as sent_xy
}
CALL {
    WITH c2,r2,covid
    match (c_yz:Citation)<-[r_in_yz:IS_IN]-(s_yz:Sentence)<-[r_extr_yz:Extracted_From]-(i_yz:Instance)-[r_sub_y:Inst_Subject]->(c2:Concept),
      (i_yz)-[r_obj_z:Inst_Object]->(covid:Concept)
    WITH c_yz, s_yz
    LIMIT 3
    RETURN collect("PMID:"+c_yz.pmid+"-"+c_yz.pyear+": "+s_yz.sentence) as sent_yz
}
RETURN sent_xy,drug.cui+":"+drug.name+"-"+type(r1)+"-> "+c2.cui+":"+c2.name+"-"+type(r2)+"-> "+covid.cui+":"+covid.name as Drug_Y_Covid,sent_yz;

// Some optimizations by Tomaz

MATCH (drug)-[r1:INHIBITS|DISRUPTS|INTERACTS_WITH]->(c2)-[r2:CAUSES|ASSOCIATED_WITH|PREDISPOSES|AUGMENTS|AFFECTS]->(covid:Concept)
USING INDEX covid:Concept(cui)
where drug.cui in ["C0011777"] and covid.cui in ["C5203670","C5203676","C5203671"] 
WITH drug,r1,c2,r2,covid order by (r1.freq+r2.freq) desc limit 20
CALL {
    WITH drug,r1,c2
    match (c_xy)<-[r_in_xy:IS_IN]-(s_xy)<-[r_extr_xy:Extracted_From]-(i_xy:Instance {predicate: type(r1)})-[r_sub_x:Inst_Subject]->(drug),
      (i_xy)-[r_obj_y:Inst_Object]->(c2)
    WITH c_xy, s_xy
    LIMIT 3
    RETURN collect("PMID:"+c_xy.pmid+"-"+c_xy.pyear+": "+s_xy.sentence) as sent_xy
}
CALL {
    WITH c2,r2,covid
    match (c_yz)<-[r_in_yz:IS_IN]-(s_yz)<-[r_extr_yz:Extracted_From]-(i_yz:Instance{predicate:type(r2)})-[r_sub_y:Inst_Subject]->(c2),
      (i_yz)-[r_obj_z:Inst_Object]->(covid)
    WITH c_yz, s_yz
    LIMIT 3
    RETURN collect("PMID:"+c_yz.pmid+"-"+c_yz.pyear+": "+s_yz.sentence) as sent_yz
}
RETURN sent_xy,drug.cui+":"+drug.name+"-"+type(r1)+"-> "+c2.cui+":"+c2.name+"-"+type(r2)+"-> "+covid.cui+":"+covid.name as Drug_Y_Covid,sent_yz;