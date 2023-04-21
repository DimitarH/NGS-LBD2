import torch
import pandas as pd
from pykeen.models.predict import get_relation_prediction_df
from pykeen.triples import TriplesFactory

device = torch.device('cpu')

my_pykeen_model = torch.load('rotate-small/trained_model.pkl', map_location=torch.device('cpu'))
my_pykeen_model.device = 'cpu'
data = pd.read_csv('triples.csv')
data.dropna(inplace=True, subset=["source", "target", "type"])

tf = TriplesFactory.from_labeled_triples(
  data[["source", "type", "target"]].values,
)

tf

def get_prediction(head, tail):
   result = get_relation_prediction_df(my_pykeen_model, head, tail, triples_factory=tf)
   return result

print(get_prediction("C0057488","C0086543"))