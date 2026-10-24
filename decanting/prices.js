const priceBuckets = new Map();
async function priceBucket(timestamp){
 if(timestamp!==undefined && priceBuckets.has(timestamp))return priceBuckets.get(timestamp);
 const url='https://prices.runescape.wiki/api/v1/osrs/5m'+(timestamp===undefined?'':'?timestamp='+timestamp);
 const response=await fetch(url);
 if(!response.ok)throw Error('Price feed unavailable');
 const result=await response.json();
 if(!Number.isFinite(result.timestamp)||!result.data||(timestamp!==undefined&&result.timestamp!==timestamp))throw Error('Invalid price window');
 priceBuckets.set(result.timestamp,result);return result;
}
async function livePrices(){
 const latest=await priceBucket();
 const buckets=await Promise.all(Array.from({length:6},(_,i)=>priceBucket(latest.timestamp-i*300)));
 const data={};
 for(const id of ['139','2434','3026','3024','6687','6685']){
  data[id]={};
  for(const side of ['High','Low']){
   const price='avg'+side+'Price',volume=side.toLowerCase()+'PriceVolume';
   const rows=buckets.map(b=>b.data[id]).filter(r=>r&&Number.isFinite(r[price])&&r[volume]>0);
   const total=rows.reduce((sum,r)=>sum+r[volume],0);
   data[id][volume]=total;
   data[id][price]=total?(side==='High'?Math.ceil:Math.floor)(rows.reduce((sum,r)=>sum+r[price]*r[volume],0)/total):null;
  }
 }
 for(const timestamp of priceBuckets.keys())if(timestamp<latest.timestamp-1500)priceBuckets.delete(timestamp);
 return {timestamp:latest.timestamp,windowStart:latest.timestamp-1500,windowEnd:latest.timestamp+300,data};
}
