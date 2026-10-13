"""Reproduce SUS and agreement frequencies from anonymized existing records.
Run: python3 derived/evaluation/recompute.py
Uses only Python's standard library. Does not recode open feedback.
"""
from pathlib import Path
import csv,json,statistics
D=Path(__file__).resolve().parent
with (D/'responses-anonymized.csv').open(encoding='utf-8',newline='') as f:
    records=list(csv.DictReader(f))
ids=[r['anonymous_id'] for r in records]
assert len(ids)==len(set(ids))==28
items=[f'SUS{i}' for i in range(1,11)]+[f'USE{i}' for i in range(1,4)]
for r in records:
    assert all(int(r[k]) in range(1,6) for k in items)
scores=[2.5*sum(int(r[f'SUS{i}'])-1 if i%2 else 5-int(r[f'SUS{i}']) for i in range(1,11)) for r in records]
summary=dict(n=len(records),mean=statistics.mean(scores),median=statistics.median(scores),sample_sd=statistics.stdev(scores),min=min(scores),max=max(scores))
frequencies={k:[sum(int(r[k])==v for r in records) for v in range(1,6)] for k in items}
with (D/'sus-scores-recomputed.csv').open(encoding='utf-8',newline='') as f:
    archived=list(csv.DictReader(f))
assert [(r['anonymous_id'],float(r['sus_score'])) for r in archived]==list(zip(ids,scores))
assert [round(summary[k],1) for k in ['mean','median','sample_sd','min','max']]==[92.1,95.0,7.7,70.0,100.0]
for name,keys in [('sus-item-frequencies.csv',items[:10]),('usefulness-frequencies.csv',items[10:])]:
    with (D/name).open(encoding='utf-8',newline='') as f: stored=list(csv.DictReader(f))
    assert [r['item'] for r in stored]==keys
    assert all([int(r[f'response_{v}']) for v in range(1,6)]==frequencies[r['item']] for r in stored)
print(json.dumps(dict(statistics=summary,item_frequencies=frequencies),ensure_ascii=False,indent=2))
