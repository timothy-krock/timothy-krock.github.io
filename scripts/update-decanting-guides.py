"""Refresh public Jagex guide prices; retain the last snapshot on failure."""
import json, time, urllib.request
from pathlib import Path
prices = {}
for item in ['139', '2434', '3026', '3024', '6687', '6685']:
    request = urllib.request.Request(
        'https://secure.runescape.com/m=itemdb_oldschool/api/catalogue/detail.json?item=' + item,
        headers={'User-Agent': 'guywhowantstbow/1.0 (timkrock.com/decanting)'})
    with urllib.request.urlopen(request, timeout=30) as response:
        prices[item] = json.load(response)['item']['current']['price']
path = Path(__file__).resolve().parent.parent / 'decanting/ge-prices.json'
path.write_text(json.dumps({'fetched': int(time.time()), 'data': prices}, indent=2) + '\n')
