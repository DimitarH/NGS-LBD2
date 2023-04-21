from flask import Flask
from flask import request
import json
import torch
import pandas as pd
from pykeen.models.predict import get_relation_prediction_df
from pykeen.triples import TriplesFactory

device = torch.device('cpu')

my_pykeen_model = torch.load(
    'pairre-small/trained_model.pkl', map_location=device)
data = pd.read_csv('pairre-small/pairre_data.csv')
data.dropna(inplace=True, subset=["source", "target", "type"])

tf = TriplesFactory.from_labeled_triples(
    data[["source", "type", "target"]].values,
)


def get_prediction(head, tail):
    result = get_relation_prediction_df(
        my_pykeen_model, head, tail, triples_factory=tf)
    return result


DEFAULT_LIMIT = 5

app = Flask(__name__)


@app.route('/', methods=['POST'])
def home():
    """
    Input:
       - Gene list
       - Pheno list 
    """

    print(request.data)
    try:
        data = json.loads(request.data.decode('utf-8'))
        genes = data['genes']
        phenos = data['phenos']
        limit = data.get('limit', DEFAULT_LIMIT)

        # Check if both inputs are lists and have at least a single element
        assert len(genes) > 0 and len(phenos) > 0 and isinstance(
            genes, list) and isinstance(phenos, list)
    except:
        return {'result': 'Missing or invalid genes and phenos inputs'}

    candidates = list()
    for g in genes:
        for p in phenos:
            print(p, g)
            try:
                d = get_prediction(g, p)
                for i, row in d[d['in_training'] == False].iterrows():
                    candidates.append(
                        {'gene': g, 'pheno': p, 'relation': row['relation_label'], 'score': row['score']})
            except Exception as e:
                print(e)

    # Sort & Construct results
    try:
        candidates = sorted(candidates, key=lambda x: x['score'], reverse=True)
        results = dict()
        results['result'] = candidates[:limit]
        return results
    except:
        return {'result': 'No prediction due to missing phenos or geno in the model'}


if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=3000)
