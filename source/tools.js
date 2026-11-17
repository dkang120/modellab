/* ModelLab tools: Match quiz, Pain Simulator, Stress Test, Implement It, Overlap Checker, Build Your Own, Leaderboard.
   Loaded after index.html's main script. Uses window.ML (exposed by index.html) and history.json (long-run proxy returns). */
(function(){
var ML=window.ML;if(!ML)return;
var esc=ML.esc,money=ML.money,fmt=ML.fmt,sign=ML.sign,$=ML.$;

/* ---------- config ---------- */
/* Leaderboard backend (Supabase). Leave empty to run in local-only mode. See supabase/schema.sql and README. */
var LB={url:'',key:''};

/* ---------- styles (reuse the site's tokens; only layout glue lives here) ---------- */
var css=document.createElement('style');
css.textContent=[
'.tl-steps{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:22px}',
'.tl-steps span{background:var(--white);border:1.5px solid var(--line);border-radius:999px;padding:8px 16px;font-size:14px;font-weight:500;color:var(--muted)}',
'.tl-steps span b{color:var(--purple);font-weight:600}',
'.tl-steps span.dn{border-color:var(--blue);color:var(--ink)}',
'.tl-emb{width:100%;margin-top:12px;border:1px solid var(--line);border-radius:16px;padding:14px;font:12px/1.5 var(--mono);color:var(--ink);background:var(--t-gray,#f1f1f3);resize:none}',
'.tl-ck{font-style:normal;color:var(--blue);font-weight:600}',
'.tl-bar{display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end;margin-bottom:18px}',
'.tl-f{display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:500;color:var(--muted)}',
'.tl-f input,.tl-f select,.tl-f textarea{font:inherit;font-size:15px;color:var(--ink);background:var(--white);border:1.5px solid var(--line);border-radius:999px;padding:11px 18px;outline:0;min-width:150px}',
'.tl-f textarea{border-radius:18px;min-height:130px;resize:vertical;width:100%;line-height:1.5}',
'.tl-f input:focus,.tl-f select:focus,.tl-f textarea:focus{border-color:var(--purple)}',
'.tl-chart{width:100%;height:auto;display:block}',
'.tl-chart text{font-family:var(--font);font-size:11px;fill:var(--muted)}',
'.tl-leg{display:flex;gap:18px;flex-wrap:wrap;font-size:13px;font-weight:500;margin:6px 0 0}',
'.tl-leg i{display:inline-block;width:18px;height:3px;border-radius:2px;margin-right:7px;vertical-align:middle}',
'.tl-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-top:18px}',
'.tl-stats .pt small{letter-spacing:.08em}',
'.tl-stats .pt b{font-size:22px}',
'.tl-stats .pt em{font-style:normal;font-size:12.5px;color:var(--muted)}',
'.tl-dec{background:var(--yellow);border-radius:20px;padding:24px 26px;margin-top:18px;display:flex;flex-direction:column;gap:14px}',
'.tl-dec h3{font-size:22px;font-weight:700;letter-spacing:-.03em}',
'.tl-dec p{color:var(--ink);font-size:16px}',
'.tl-dec .btns,.tl-row .btns{display:flex;gap:10px;flex-wrap:wrap}',
'.tl-prog{height:8px;border-radius:6px;background:var(--lilac);overflow:hidden;margin:6px 0 22px}',
'.tl-prog i{display:block;height:100%;background:var(--purple);border-radius:6px}',
'.tl-q h2{font-size:clamp(24px,3.4vw,34px);letter-spacing:-.035em;margin-bottom:22px}',
'.tl-opts{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}',
'.tl-opt{text-align:left;background:var(--white);border:1.5px solid var(--line);border-radius:18px;padding:18px 20px;font-size:16px;font-weight:500;transition:transform .12s ease,border-color .12s ease}',
'.tl-opt:hover{transform:translateY(-1px);border-color:var(--purple)}',
'.tl-opt small{display:block;font-weight:400;color:var(--muted);font-size:13.5px;margin-top:4px}',
'.tl-res{display:flex;flex-direction:column;gap:14px}',
'.tl-hit{display:grid;grid-template-columns:auto 1fr auto;gap:16px;align-items:center;border-radius:20px;padding:18px 22px;text-decoration:none}',
'.tl-hit .n{width:40px;height:40px;border-radius:50%;background:var(--white);display:grid;place-items:center;font-weight:700}',
'.tl-hit b{font-size:19px;letter-spacing:-.02em}',
'.tl-hit span.w{display:block;color:var(--muted);font-size:14px;margin-top:2px}',
'.tl-hit .v{color:var(--purple);font-weight:600;font-size:15px}',
'.tl-hm td,.tl-hm th{text-align:center}.tl-hm td:first-child,.tl-hm th:first-child{text-align:left}',
'.tl-hm td.c{font-weight:600;font-size:14px}',
'.tl-hm th button{background:none;border:0;font:inherit;font-size:11px;font-weight:600;letter-spacing:.1em;color:var(--muted);padding:0}',
'.tl-hm th button[aria-pressed=true]{color:var(--purple)}',
'.tl-hm table{min-width:760px}',
'.tl-hold{display:grid;grid-template-columns:1.4fr .8fr auto;gap:10px;align-items:center;margin-bottom:10px}',
'.tl-hold select,.tl-hold input{font:inherit;font-size:15px;border:1.5px solid var(--line);border-radius:999px;padding:10px 16px;background:var(--white);color:var(--ink);outline:0;width:100%}',
'.tl-x{background:none;border:0;color:var(--muted);font-size:18px;padding:6px 10px}',
'.tl-bars .r{display:grid;grid-template-columns:120px 1fr 54px;gap:12px;align-items:center;font-size:14px;margin:8px 0}',
'.tl-bars .t{height:12px;border-radius:8px;background:var(--lilac);overflow:hidden}.tl-bars .t i{display:block;height:100%;background:var(--purple)}',
'.tl-lbhead{display:flex;justify-content:space-between;gap:16px;align-items:center;flex-wrap:wrap;margin-bottom:6px}',
'.tl-me td{background:var(--t-blue)}',
'.tl-warn{background:var(--peach);border-radius:16px;padding:14px 18px;font-size:14px;color:var(--ink);margin-top:14px}',
'.tl-ok{background:var(--mint);border-radius:16px;padding:14px 18px;font-size:14px;margin-top:14px}',
'@media(max-width:700px){.tl-opts{grid-template-columns:1fr}.tl-hold{grid-template-columns:1fr 90px auto}.tl-hit{grid-template-columns:auto 1fr}.tl-hit .v{display:none}.tl-bars .r{grid-template-columns:90px 1fr 46px}}'
].join('\n');
document.head.appendChild(css);

/* ---------- history engine ---------- */
var H=null,HM=[],HI={},hState='idle',MS={};
var MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function mlab(s){var p=s.split('-');return MONTHS[Number(p[1])-1]+' '+p[0];}
function ensureHist(){
  if(H||hState==='loading'||hState==='error')return;
  hState='loading';
  var urls=['./history.json','../history.json'];
  (function next(i){
    if(i>=urls.length){hState='error';ML.rerender();return;}
    fetch(urls[i]).then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(j){
      H=j;var y=1926,m=7;HM=[];HI={};
      for(var k=0;k<j.n;k++){var s=y+'-'+(m<10?'0':'')+m;HM.push(s);HI[s]=k;if(m===12){y++;m=1;}else m++;}
      hState='ready';buildStats();ML.rerender();
    }).catch(function(){next(i+1);});
  })(0);
}
function pr(t){var id=H&&H.map[t];return id?H.proxies[id]:null;}
function rAt(t,g){var p=pr(t);if(!p||p.start==null)return null;var i=g-p.start;if(i<0||i>=p.r.length)return null;return p.r[i];}
function startOf(hold){var s=0;for(var i=0;i<hold.length;i++){var p=pr(hold[i][0]);if(!p||p.start==null)return Infinity;s=Math.max(s,p.start);}return s;}
function toH(m){return m.hold.map(function(x){return [x[0],x[2]];});}
/* Monthly total-return path with fixed target weights. rebal: 'annual' | 'none'. path[0]=start amount, path[k]=end of k-th month. */
function sim(hold,g0,g1,amt,rebal,c){c=c||0;
  var tot=0,w=hold.map(function(h){tot+=h[1];return h[1];});w=w.map(function(x){return x/tot;});
  var v=w.map(function(x){return x*amt;}),path=[amt],i,k;
  for(var g=g0;g<=g1;g++){
    var s=0;
    if(c)for(i=0;i<hold.length;i++)v[i]+=w[i]*c;
    for(i=0;i<hold.length;i++){var r=rAt(hold[i][0],g);if(r==null)return null;v[i]*=1+r/100;s+=v[i];}
    path.push(s);k=g-g0;
    if(rebal!=='none'&&k%12===11){for(i=0;i<w.length;i++)v[i]=w[i]*s;}
  }
  return path;
}
function pstats(path){
  var peak=path[0],pk=0,mdd=0,mp=0,mt=0,under=0,i;
  for(i=1;i<path.length;i++){
    if(path[i]>peak){peak=path[i];pk=i;}
    var dd=path[i]/peak-1;if(dd<mdd){mdd=dd;mp=pk;mt=i;}
    if(path[i]<peak)under++;
  }
  var rec=null;if(mdd<0){for(i=mt+1;i<path.length;i++){if(path[i]>=path[mp]){rec=i-mt;break;}}}
  var n=path.length-1,tr=path[n]/path[0]-1,cagr=n>=12?Math.pow(1+tr,12/n)-1:null;
  var worst12=null,best12=null;
  for(i=12;i<path.length;i++){var r12=path[i]/path[i-12]-1;if(worst12==null||r12<worst12)worst12=r12;if(best12==null||r12>best12)best12=r12;}
  return {mdd:mdd,peakK:mp,troughK:mt,recover:rec,total:tr,cagr:cagr,under:under,worst12:worst12,best12:best12,n:n};
}
function buildStats(){
  var g0=HI['1992-02'],g1=HM.length-1;
  ML.MODELS.forEach(function(m){var p=sim(toH(m),g0,g1,10000,'annual');if(p){var s=pstats(p);MS[m.id]=s;}});
}
function pct1(v){return (v<0?'−':(v>0?'+':''))+Math.abs(v*100).toFixed(1)+'%';}
function pctAbs(v){return Math.abs(v*100).toFixed(0)+'%';}

/* ---------- chart (plain SVG, site colors) ---------- */
function mshort(n){return n>=1e6?'$'+(n/1e6).toFixed(1)+'M':(n>=1e4?'$'+Math.round(n/1e3)+'k':(n>=1e3?'$'+(n/1e3).toFixed(1)+'k':'$'+Math.round(n)));}
function chart(o){
  var W=720,Ht=o.h||300,L=58,R=16,T=14,B=30,iw=W-L-R,ih=Ht-T-B,n=o.n,lo=o.ymin,hi=o.ymax,log=!!o.log,i;
  function X(i){return L+iw*i/Math.max(1,n-1);}
  function Y(v){var a=log?Math.log(lo):lo,b=log?Math.log(hi):hi,c=log?Math.log(Math.max(v,lo)):v;return T+ih*(1-(c-a)/(b-a));}
  var s='<svg class="tl-chart" viewBox="0 0 '+W+' '+Ht+'" role="img" aria-label="'+esc(o.aria||'Chart')+'">';
  for(i=0;i<=4;i++){var gv=log?Math.exp(Math.log(lo)+(Math.log(hi)-Math.log(lo))*i/4):lo+(hi-lo)*i/4,gy=Y(gv);
    s+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+gy+'" y2="'+gy+'" stroke="#e9e9eb" stroke-width="1"/><text x="'+(L-8)+'" y="'+(gy+4)+'" text-anchor="end">'+mshort(gv)+'</text>';}
  var y0=Number((o.labels[0]||'0').slice(0,4)),y1=Number((o.labels[n-1]||'0').slice(0,4)),step=Math.max(1,Math.ceil((y1-y0)/6));
  for(i=0;i<n;i++){var lb=o.labels[i]||'',yy=Number(lb.slice(0,4));
    if(lb.slice(5,7)==='01'&&yy%step===0&&i>0&&i<n-1){s+='<line x1="'+X(i)+'" x2="'+X(i)+'" y1="'+(T+ih)+'" y2="'+(T+ih+4)+'" stroke="#a3a3a8"/><text x="'+X(i)+'" y="'+(Ht-8)+'" text-anchor="middle">'+yy+'</text>';}}
  s+='<text x="'+L+'" y="'+(Ht-8)+'" text-anchor="start">'+esc(o.labels[0]?mlab(o.labels[0]):'')+'</text>';
  if(o.base!=null){var by=Y(o.base);s+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+by+'" y2="'+by+'" stroke="#a3a3a8" stroke-width="1" stroke-dasharray="3 4"/>';}
  (o.marks||[]).forEach(function(mk){var mx=X(mk.i);s+='<line x1="'+mx+'" x2="'+mx+'" y1="'+T+'" y2="'+(T+ih)+'" stroke="#E51317" stroke-width="1.5" stroke-dasharray="4 4"/><text x="'+Math.min(mx+6,W-R-70)+'" y="'+(T+12)+'" style="fill:#E51317;font-weight:600">'+esc(mk.label)+'</text>';});
  o.series.forEach(function(se){
    var d='',pen=false;
    for(i=0;i<se.vals.length;i++){var v=se.vals[i];if(v==null){pen=false;continue;}d+=(pen?'L':'M')+X(i).toFixed(1)+' '+Y(v).toFixed(1);pen=true;}
    s+='<path d="'+d+'" fill="none" stroke="'+se.color+'" stroke-width="'+(se.w||2.6)+'" stroke-linejoin="round" stroke-linecap="round"'+(se.dash?' stroke-dasharray="'+se.dash+'"':'')+'/>';
  });
  return s+'</svg>';
}
function legend(items){return '<div class="tl-leg">'+items.map(function(a){return '<span><i style="background:'+a[1]+(a[2]?';opacity:.7':'')+'"></i>'+esc(a[0])+'</span>';}).join('')+'</div>';}
function statBox(label,val,sub,cls){return '<div class="pt '+(cls||'na')+'"><small>'+label+'</small><b>'+val+'</b>'+(sub?'<em>'+sub+'</em>':'')+'</div>';}
function note(t){return '<p class="note">'+t+'</p>';}
function histNote(){return 'Built from long-run proxy series (Kenneth French Data Library, FRED Treasury yields, monthly gold and commodity prices), not each fund’s own returns. Total return for stocks, estimated for bonds, price only for gold and commodities. Annual rebalancing, no fees or taxes. Past results do not predict future results. Educational only, not investment advice.';}
function head(title,sub,steps){return '<div class="wrap"><div class="phead"><h1 class="display">'+title+'</h1><p class="sub">'+sub+'</p>'+(steps||'')+'</div>';}
function loadingView(title,sub){
  ensureHist();
  return head(title,sub)+'<div class="stack"><div class="panel sh" aria-busy="true"><p class="b">'+(hState==='error'?'History data could not be loaded. Reload the page to try again.':'Loading 100 years of market history…')+'</p></div></div></div>';
}
function gateView(title,sub,why,ctx){
  return head(title,sub)+'<div class="cgate">'+ML.gatePanel('Unlock '+title,why+' Free with your email. You also get weekly price snapshots and a weekly email about one model.',ctx)+'</div></div>';
}
function modelOpts(sel,filterFn){return ML.MODELS.filter(filterFn||function(){return true;}).map(function(m){return '<option value="'+m.id+'"'+(m.id===sel?' selected':'')+'>'+esc(m.name)+'</option>';}).join('');}
function srcLine(){return ML.srcTxt();}

/* ---------- scenarios ---------- */
var SCEN=[
 {id:'dot',name:'Dot-com bust',from:'2000-02',to:'2002-09',label:'Invest end of Feb 2000',blurb:'The S&P 500 set its then-record high in March 2000. It fell for the next 2.5 years.'},
 {id:'gfc',name:'2008 crisis',from:'2007-10',to:'2009-02',label:'Invest end of Oct 2007',blurb:'The S&P 500 hit its record high in October 2007, before the financial crisis.'},
 {id:'covid',name:'COVID crash',from:'2020-01',to:'2020-03',label:'Invest end of Jan 2020',blurb:'The fastest 30% drop on record for US stocks began in February 2020.'},
 {id:'rates',name:'2022 rate shock',from:'2021-12',to:'2022-09',label:'Invest end of Dec 2021',blurb:'Stocks and bonds fell together as interest rates rose sharply.'},
 {id:'black',name:'1987 crash',from:'1987-07',to:'1987-11',label:'Invest end of Jul 1987',blurb:'US stocks fell about a third in three months, ending with the October 1987 crash.'},
 {id:'stag',name:'1973–74 bear',from:'1972-12',to:'1974-09',label:'Invest end of Dec 1972',blurb:'Oil shock, inflation and recession. Stocks fell roughly half.'}
];
function scenWin(sc){return {g0:HI[sc.from]+1,g1:HI[sc.to]};}

/* ================= TOOLS HUB ================= */
function viewTools(){
  var cards=[
   ['mint','Step 1 · Match','Match Quiz','Six questions about how you would actually behave. Get the models that fit, backed by how far each one really fell.','#match','Take the quiz →'],
   ['peach','Step 2 · Feel the risk','Pain Simulator','Invest at a bad moment in history and watch it happen. Sell, hold or buy more when it hurts.','#pain','Try it →'],
   ['lilac','Step 2 · Feel the risk','Stress Test','Every model against six real market crashes, side by side.','#stress','Compare crashes →'],
   ['yellow','Step 3 · Act','Implement It','Turn a model into exact dollar amounts, share counts and a rebalance plan.','#implement','Build my plan →'],
   ['blue','Step 3 · Act','Overlap Checker','Paste what you own. See which model it already resembles and where you are concentrated.','#overlap','Check my holdings →'],
   ['mint','Go further','Build Your Own','Pick holdings and weights. Test them against 30–100 years of history and compare with any model.','#build','Open the builder →'],
   ['peach','Compete','Leaderboard','Track a virtual portfolio from today’s close against everyone else. No real money.','#leaderboard','See the board →']
  ];
  var pg=progGet(),nx=!pg.match?['#match','Start with the Match Quiz']:(!pg.pain?['#pain','Next: feel the risk with the Pain Simulator']:(!pg.implement?['#implement','Next: build your plan']:['#build','All three steps done. Try Build Your Own']));
  var dn=function(k){return pg[k]?'<i class="tl-ck" aria-label="done">✓</i> ':'';};
  var thread='<div class="imsg" aria-label="Conversation"><div class="im in">how would you actually handle a crash?</div><div class="im out">honestly no idea</div><div class="im in">ok. three steps. match, feel the risk, then act.</div><div class="im out">bet. where do i start?</div></div>';
  return head('Tools.','Match a model to how you behave, feel the risk, then act on it.',thread+'<div class="tl-steps"><span class="'+(pg.match?'dn':'')+'">'+dn('match')+'<b>1</b> Match</span><span class="'+(pg.pain?'dn':'')+'">'+dn('pain')+'<b>2</b> Feel the risk</span><span class="'+(pg.implement?'dn':'')+'">'+dn('implement')+'<b>3</b> Act</span></div><p class="center" style="margin-top:16px"><a class="btn pri sm" href="'+nx[0]+'">'+nx[1]+' →</a></p>')+
   '<div class="grid3 tl-hub" style="padding-bottom:100px">'+cards.map(function(c){return '<a class="mcard" style="background:var(--'+c[0]+')" href="'+c[4]+'"><span class="cat">'+c[1]+'</span><h3>'+c[2]+'</h3><p>'+c[3]+'</p><span class="go">'+(pg[c[4].slice(1)]?'Done ✓ · ':'')+c[5]+'</span></a>';}).join('')+'</div></div>';
}

/* ================= MATCH QUIZ ================= */
var QZ=[
 {k:'tol',q:'Your $10,000 falls to $7,000 in three months. What do you most likely do?',a:[['Sell everything to stop the losses',0.10,'You would act around a 10% drop'],['Sell some and keep the rest',0.20,'Around 20%'],['Do nothing and wait',0.30,'You can sit through about 30%'],['Buy more while it is cheap',0.45,'You can sit through 40%+']]},
 {k:'yrs',q:'When might you need this money?',a:[['In under 3 years',2],['In 3–7 years',5],['In 7–15 years',10],['In 15+ years',20]]},
 {k:'eff',q:'How much time will you spend on your investments?',a:[['Almost none. Set it and forget it',1],['An hour a month',2],['An hour a week',3],['Several hours a week',5]]},
 {k:'gro',q:'Which sounds more like you?',a:[['I mostly want to avoid losing money',2,'Protect first'],['I want a balance of growth and safety',3,'Balanced'],['I want the most growth, bumps included',5,'Growth first']]},
 {k:'stk',q:'How do you feel about picking individual companies?',a:[['Funds only, please',0,'Index funds and ETFs'],['Open to a few stocks',1,'Funds plus some stocks']]},
 {k:'dd2',q:'Think of the worst year of your life with money. How long could you wait for a portfolio to recover?',a:[['Under a year',12],['Up to 3 years',36],['Up to 5 years',60],['As long as it takes',999]]}
];
var STOCKY={dogs:1,garp:1,'core-satellite':1};
var Q={i:0,a:[],done:false,saved:0};
function minYears(m){var x=(m.horizon||'').match(/\d+/);return x?Number(x[0]):1;}
function matchRank(){
  var T=Q.a[0],Y=Q.a[1],E=Q.a[2],G=Q.a[3],S=Q.a[4],W=Q.a[5];
  return ML.MODELS.map(function(m){
    var ms=MS[m.id],sc=0,why=[],flag=[];
    if(ms){
      var over=Math.max(0,-ms.mdd-T);sc+=over*20;
      why.push('Worst fall since 1992: '+pct1(ms.mdd)+(ms.recover!=null?', back to its old high after '+ms.recover+' months':', not back to its old high yet'));
      if(over>0.005)flag.push('fell '+pctAbs(-ms.mdd)+' at its worst, past the '+pctAbs(T)+' you said you could sit through');
      if(ms.recover!=null&&ms.recover>W){sc+=2;flag.push('took '+ms.recover+' months to recover, longer than you said you could wait');}
      if(ms.recover==null&&ms.mdd<0&&W<999){sc+=2;}
    }
    if(m.effort>E){sc+=(m.effort-E)*1.2;flag.push('asks for more effort than you want');}
    sc+=Math.abs(m.growth-G)*0.8;
    if(minYears(m)>Y){sc+=2;flag.push('is meant for a horizon of '+m.horizon);}
    if(!S&&STOCKY[m.id]){sc+=3;flag.push('uses individual stocks');}
    return {m:m,sc:sc,why:why,flag:flag,ms:ms};
  }).sort(function(a,b){return a.sc-b.sc;});
}
function viewMatch(){
  if(hState!=='ready')return loadingView('Match Quiz.','Find the models that fit how you would actually behave.');
  if(Q.done){
    var r=matchRank(),top=r.slice(0,3),avoid=r.slice().reverse().filter(function(x){return x.flag.length;}).slice(0,2),bg=['mint','yellow','peach'];
    return head('Your matches.','Based on your answers and how each model behaved in real history.')+
    '<div class="stack"><div class="tl-res">'+top.map(function(x,i){return '<a class="tl-hit" style="background:var(--'+bg[i]+')" href="#m-'+x.m.id+'"><span class="n">'+(i+1)+'</span><div><b>'+esc(x.m.name)+'</b><span class="w">'+esc(x.m.tag)+'</span><span class="w">'+esc(x.why[0]||'')+'</span>'+(x.flag.length?'<span class="w">Watch out: '+esc(x.flag.join('; '))+'</span>':'')+'</div><span class="v">View →</span></a>';}).join('')+'</div>'+
    (avoid.length?'<div class="panel sh"><h2 style="font-size:22px">Likely poor fits</h2><p class="note" style="margin-top:6px">These clashed most with your answers.</p><div class="tl-bars" style="margin-top:8px">'+avoid.map(function(x){return '<p style="margin:10px 0"><b>'+esc(x.m.name)+'</b> <span style="color:var(--muted)">— '+esc(x.flag.join('; '))+'</span></p>';}).join('')+'</div></div>':'')+
    '<div class="panel sh"><h2 style="font-size:22px">Share your match</h2><p class="b" style="margin-top:8px">Send friends the card and see what they get.</p><div class="btns" style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px"><button class="btn light sm" data-t-share="match">Share my match</button><button class="btn light sm" data-t-link="match">Copy quiz link</button></div>'+(emailSaved()?'<p class="note">Your top match is saved to your email profile so the weekly emails fit you. Educational only.</p>':'')+'</div>'+
    '<a class="buddy-cta" href="#text"><span class="im in">want me to text you when '+esc(top[0].m.name.toLowerCase())+' gets rocky? \uD83D\uDCF1</span><span class="im out pu">yes pls</span></a>'+'<div class="panel" style="background:var(--lilac)"><h2 style="font-size:22px">Next: feel the risk</h2><p class="b" style="margin-top:8px">See how your top match behaves when you invest at a bad time.</p><div class="btns" style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px"><a class="btn pri sm" href="#pain/'+top[0].m.id+'">Run the Pain Simulator</a><a class="btn light sm" href="#implement/'+top[0].m.id+'">Build my plan</a><button class="btn light sm" data-t-qreset="1">Retake quiz</button></div></div>'+
    note('Drops and recovery times use the proxy history from Feb 1992 to today. '+histNote())+'</div></div>';
  }
  var q=QZ[Q.i];
  return head('Match Quiz.','Six questions about how you would actually behave.')+
   '<div class="stack"><div class="panel sh tl-q story-q"><div class="sq-bars" role="progressbar" aria-valuemin="0" aria-valuemax="'+QZ.length+'" aria-valuenow="'+Q.i+'">'+QZ.map(function(x,j){return '<i class="'+(j<Q.i?'done':(j===Q.i?'cur':''))+'"></i>';}).join('')+'</div>'+
   '<div class="sq-who"><span class="av sm">'+ML.LOGO+'</span><b>@modellab</b><span>· quiz · '+(Q.i+1)+'/'+QZ.length+'</span></div><div class="im in sq-q">'+esc(q.q)+'</div><p class="sq-hint">tap your answer</p><div class="tl-opts">'+
   q.a.map(function(a,j){return '<button class="tl-opt" data-t-q="'+j+'">'+esc(a[0])+(a[2]?'<small>'+esc(a[2])+'</small>':'')+'</button>';}).join('')+'</div>'+
   (Q.i>0?'<p style="margin-top:18px"><button class="chip" data-t-qback="1">← Back</button></p>':'')+'</div></div></div>';
}

/* ================= PAIN SIMULATOR ================= */
var P={contrib:0,idx:null,m:'index',sc:'gfc',amt:10000,k:0,len:0,timer:null,dec:null,decK:null,g0:0,hold:null,mkt:null,cash:null,pause:null,done:false,custom:''};
function painInit(arg){
  painQuery();
  if(arg&&ML.byId[arg])P.m=arg;
  painReset();
}
function painCurHold(){return toH(ML.byId[P.m]);}
function painWindow(){
  if(/^\d{4}-\d{2}$/.test(P.sc))return {g0:HI[P.sc]+1};
  var sc=SCEN.filter(function(s){return s.id===P.sc;})[0];return {g0:HI[sc.from]+1};
}
function painReset(){
  painStop();
  P.k=0;P.dec=null;P.decK=null;P.done=false;P.pause=null;
  var w=painWindow();P.g0=w.g0;
  var last=HM.length-1;P.len=Math.min(120,last-P.g0+1);
  if(P.len<6){P.hold=null;return;}
  P.hold=sim(painCurHold(),P.g0,P.g0+P.len-1,P.amt,'annual',P.contrib);
  P.mkt=sim([['VTI',100]],P.g0,P.g0+P.len-1,P.amt,'annual',P.contrib);
  P.cash=sim([['BIL',100]],P.g0,P.g0+P.len-1,1,'annual');
  if(P.hold){var c0=P.contrib||0;P.idx=[1];for(var j=1;j<P.hold.length;j++)P.idx[j]=P.idx[j-1]*P.hold[j]/(P.hold[j-1]+c0);
    var peak=P.idx[0];for(var i=1;i<P.idx.length;i++){if(P.idx[i]>peak)peak=P.idx[i];if(P.idx[i]/peak-1<=-0.15){P.pause=i;break;}}}
}
function painYou(){
  var h=P.hold,k=P.decK,c=P.contrib||0,you=h.slice(),j;
  if(P.dec==='sell'){for(j=k+1;j<h.length;j++){var cr=P.cash?P.cash[j]/P.cash[j-1]:1;you[j]=(you[j-1]+c)*cr;}}
  if(P.dec==='buy'){you[k]=h[k]+P.amt*0.5;for(j=k+1;j<h.length;j++)you[j]=(you[j-1]+c)*(h[j]/(h[j-1]+c));}
  return you;
}
function painInv(k){var inv=P.amt+(P.contrib||0)*k;if(P.dec==='buy'&&P.decK!=null&&k>=P.decK)inv+=P.amt*0.5;return inv;}
function painStop(){if(P.timer){clearInterval(P.timer);P.timer=null;}}
function painPlay(speed){
  painStop();if(!P.hold||P.done)return;
  P.timer=setInterval(function(){
    P.k++;
    if(P.k>=P.len){P.k=P.len;P.done=true;painStop();}
    else if(P.pause!=null&&P.k===P.pause&&P.dec==null){painStop();}
    painPaint();
  },speed||110);
  painPaint();
}
function painDD(path,k){var pk=path[0];for(var i=1;i<=k;i++)if(path[i]>pk)pk=path[i];return path[k]/pk-1;}
function painChartHtml(){
  var h=P.hold,k=P.k,labs=[],i;
  for(i=0;i<=P.len;i++)labs.push(HM[P.g0-1+i]||'');
  var you=P.dec?painYou():h,series=[];
  var all=h.concat(P.mkt);if(P.dec==='buy')all=all.concat(painYou());
  var lo=Math.min.apply(null,all)*0.92,hi=Math.max.apply(null,all)*1.06;
  series.push({vals:P.mkt.map(function(v,j){return j<=k?v:null;}),color:'#dedee2',w:2});
  if(P.dec&&P.dec!=='hold')series.push({vals:h.map(function(v,j){return j<=k?v:null;}),color:'#c5dcff',w:2.2,dash:'6 5'});
  series.push({vals:you.map(function(v,j){return j<=k?v:null;}),color:'#4c90f7',w:3});
  var marks=P.decK!=null&&k>=P.decK?[{i:P.decK,label:P.dec==='sell'?'You sold':(P.dec==='buy'?'You bought more':'You held')}]:[];
  return chart({n:P.len+1,labels:labs,series:series,ymin:lo,ymax:hi,base:P.amt,marks:marks,aria:'Portfolio value over time',tick:function(l){return l.slice(0,4);}});
}
function painBody(){
  var m=ML.byId[P.m],h=P.hold,k=P.k;
  var you=P.dec?painYou():h,cur=you[k],inv=painInv(k),dd=painDD(P.idx,k),curLab=HM[P.g0-1+k]?mlab(HM[P.g0-1+k]):'Start';
  var underNow=0;for(var i=1;i<=k;i++){if(P.idx[i]<Math.max.apply(null,P.idx.slice(0,i+1)))underNow++;}
  var s='<div class="tl-stats">'+
   statBox('MONTH',k+' of '+P.len,curLab)+
   statBox('PORTFOLIO VALUE',money(cur),(cur>=inv?'+':'−')+money(Math.abs(cur-inv))+(P.contrib?' vs what you put in':' vs start'),cur>=inv?'up':'dn')+
   statBox('BELOW ITS PEAK',pct1(dd),underNow+' months underwater',dd<-0.005?'dn':'na')+
   statBox('US STOCK MARKET',money(P.mkt[k]),'for reference')+'</div>';
  var out='<div id="pn-chart">'+painChartHtml()+'</div>'+legend([[P.dec&&P.dec!=='hold'?'Your choice':m.name,'#4c90f7'],P.dec&&P.dec!=='hold'?['If you had held','#c5dcff']:null,['US stock market','#dedee2']].filter(Boolean))+s;
  out+=painThread(dd,k,curLab);
  if(P.pause!=null&&k===P.pause&&P.dec==null){
    out+='<div class="tl-dec" role="alertdialog" aria-live="assertive"><h3>'+curLab+': you are down '+pctAbs(dd)+' from the peak.</h3><p>'+(P.contrib?'You have put in '+money(inv)+' and it':'Your $'+Math.round(P.amt).toLocaleString('en-US'))+' is now worth <b>'+money(cur)+'</b>. The news is bad. What do you do?</p><div class="btns"><button class="btn light" data-t-pdec="sell">Sell everything</button><button class="btn light" data-t-pdec="hold">Hold</button><button class="btn pri" data-t-pdec="buy">Buy more ('+money(P.amt*0.5)+')</button></div></div>';
  }
  if(P.done)out+=painSummary();
  return out;
}
function painThread(dd,k,curLab){
  var lo=0,msgs=[];for(var i=1;i<=k;i++){var d=painDD(P.idx,i);if(d<lo)lo=d;}
  var T=[[-0.10,'down 10%. you good?'],[-0.20,'down 20%. this is where it starts to sting.'],[-0.30,'down 30%. this is where most people sell.'],[-0.40,'down 40%. still with me?'],[-0.50,'down 50%. half of it, on paper.']];
  T.forEach(function(t){if(lo<=t[0])msgs.push(['in',t[1]]);});
  if(P.dec){msgs.push(['out',P.dec==='sell'?'i’m out. selling everything.':(P.dec==='buy'?'buying more. it’s on sale.':'holding. not touching it.')]);}
  if(P.done)msgs.push(['in',dd>-0.005?'it’s back above its old high.':'window’s over. here’s what happened ↓']);
  if(!msgs.length)msgs.push(['in',k?'so far so good.':'you just invested. here we go.']);
  return '<div class="imsg pn-thread" aria-live="polite">'+msgs.slice(-5).map(function(x){return '<div class="im '+x[0]+'">'+esc(x[1])+'</div>';}).join('')+'</div>';
}
function painSummary(){
  markProg('pain');
  var h=P.hold,st=pstats(P.idx),you=P.dec?painYou():h,fy=you[P.len],fh=h[P.len],inv=painInv(P.len);
  var lines=[];
  lines.push('Held the whole way, '+ML.byId[P.m].name+' fell as far as <b>'+pct1(st.mdd)+'</b> and spent <b>'+st.under+' of '+P.len+' months</b> below an earlier high'+(st.recover!=null?', taking '+st.recover+' months to climb back from the bottom.':', and had not fully recovered by the end of this window.'));
  if(P.dec==='sell'){var d=fy-fh;lines.push('You sold in '+mlab(HM[P.g0-1+P.decK])+' at '+pct1(painDD(P.idx,P.decK))+' and moved to Treasury bills. You finished with <b>'+money(fy)+'</b> versus <b>'+money(fh)+'</b> if you had held: '+(d<0?'<b>'+money(-d)+' less</b>. Selling locked in the drop.':'<b>'+money(d)+' more</b>. In this window, selling avoided further losses, but you also had to decide when to buy back in.'));}
  else if(P.dec==='buy'){lines.push('You added '+money(P.amt*0.5)+' at the low-ish point. You put in '+money(inv)+' total and finished with <b>'+money(fy)+'</b> ('+(fy>=inv?'+':'−')+money(Math.abs(fy-inv))+' vs what you put in).');}
  else if(P.dec==='hold'){lines.push('You held. Finishing value: <b>'+money(fy)+'</b> ('+(fy>=inv?'+':'−')+money(Math.abs(fy-inv))+(P.contrib?' vs the '+money(inv)+' you put in':'')+').');}
  else lines.push('This model never fell 15% from a peak in this window, so there was no tough choice to make. Final value: <b>'+money(fy)+'</b>.');
  return '<div class="panel" style="background:var(--lilac);margin-top:18px"><h2 style="font-size:22px">What happened</h2>'+lines.map(function(l){return '<p class="b" style="margin-top:10px">'+l+'</p>';}).join('')+'<div class="btns" style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px"><button class="btn pri sm" data-t-prestart="1">Try another start date</button><a class="btn light sm" href="#implement/'+P.m+'">Build my plan for this model</a></div><div class="btns" style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px"><button class="btn light sm" data-t-share="pain">Share my result</button><button class="btn light sm" data-t-link="pain">Copy challenge link</button></div></div>';
}
function painPaint(){
  var el=$('#pn-body');if(!el)return;el.innerHTML=painBody();
}
function viewPain(arg){
  if(hState!=='ready')return loadingView('Pain Simulator.','Invest at a bad moment and see if you hold.');
  if(!ML.unlocked())return gateView('Pain Simulator','Invest at a bad moment in history and decide in real time.','Real market history, your decisions.','pain');
  if(!P.hold&&P.len===0)painInit(arg);
  else if(arg&&ML.byId[arg]&&arg!==P.m){P.m=arg;painReset();}
  var avail=SCEN.map(function(sc){var w=scenWin(sc),p=sim(painCurHold(),w.g0,Math.min(w.g0+5,HM.length-1),1,'annual');return {sc:sc,ok:!!p};});
  var chips=avail.map(function(a){return '<button class="chip" data-t-psc="'+a.sc.id+'" aria-pressed="'+(P.sc===a.sc.id)+'"'+(a.ok?'':' disabled style="opacity:.45;cursor:not-allowed"')+' title="'+(a.ok?esc(a.sc.blurb):'This model needs data that starts later')+'">'+esc(a.sc.name)+'</button>';}).join('');
  var curSc=SCEN.filter(function(s){return s.id===P.sc;})[0];
  var ctl='<div class="tl-bar"><label class="tl-f">Model<select id="pn-m">'+modelOpts(P.m)+'</select></label><label class="tl-f">Amount<input id="pn-amt" type="number" inputmode="numeric" min="100" step="500" value="'+P.amt+'"></label><label class="tl-f">Add monthly<input id="pn-contrib" type="number" inputmode="numeric" min="0" step="50" value="'+P.contrib+'"></label><label class="tl-f">Start<input id="pn-date" type="month" min="1927-01" max="'+HM[HM.length-7]+'" value="'+(/^\d{4}-\d{2}$/.test(P.sc)?P.sc:'')+'"></label></div>';
  var body=!P.hold?'<p class="b">This model has no data for that start date. Try a later one.</p>':painBody();
  return head('Pain Simulator.','Invest at a bad moment in history. Decide when it hurts.','<div class="tl-steps"><span><b>Step 2</b> Feel the risk</span></div>')+
   '<div class="stack"><div class="panel sh"><div id="pn-ctl">'+ctl+'<div class="chips" role="group" aria-label="Choose a start date">'+chips+'</div>'+(curSc?'<p class="note" style="margin-top:12px"><b>'+esc(curSc.label)+'.</b> '+esc(curSc.blurb)+'</p>':'')+
   '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px"><button class="btn pri" data-t-pplay="1">'+(P.k>0&&!P.done?'Resume':'Start the clock')+'</button><button class="btn light" data-t-pskip="1">Skip to the end</button></div></div>'+
   '<div id="pn-body" style="margin-top:22px">'+body+'</div>'+note(histNote()+' Each run starts from your chosen amount, stays fully invested at the model’s weights and pauses once when the portfolio first falls 15% from a peak.')+'</div></div></div>';
}

/* ================= STRESS TEST ================= */
var SX={sort:'gfc'};
function stressCell(m,sc){
  var w=scenWin(sc),p=sim(toH(m),w.g0,w.g1,10000,'annual');if(!p)return null;
  var s=pstats(p);return {mdd:s.mdd,tot:s.total};
}
function heat(v){ // v = drawdown (negative). Map 0..-50% to mint->peach->coral
  var x=Math.min(1,Math.max(0,-v/0.5)),a=x<0.5?[241,241,243]:[253,236,236],b=x<0.5?[253,236,236]:[244,150,152],t=x<0.5?x*2:(x-0.5)*2;
  return 'rgb('+a.map(function(c,i){return Math.round(c+(b[i]-c)*t);}).join(',')+')';
}
function viewStress(){
  if(hState!=='ready')return loadingView('Stress Test.','Every model against six real market crashes.');
  if(!ML.unlocked())return gateView('Stress Test','See every model against six real crashes.','Side-by-side drawdowns.','stress');
  var rows=ML.MODELS.concat([{id:'_mkt',name:'US stock market',hold:[['VTI','',100,'']],cat:'Reference'}]).map(function(m){
    var cells=SCEN.map(function(sc){return stressCell(m,sc);});return {m:m,cells:cells,ms:MS[m.id]};
  });
  var si=SCEN.map(function(s){return s.id;}).indexOf(SX.sort);
  rows.sort(function(a,b){
    if(a.m.id==='_mkt')return 1;if(b.m.id==='_mkt')return -1;
    var av=si>=0?(a.cells[si]?a.cells[si].mdd:-9):(a.ms?a.ms.mdd:-9),bv=si>=0?(b.cells[si]?b.cells[si].mdd:-9):(b.ms?b.ms.mdd:-9);return bv-av;});
  var hdr=SCEN.map(function(sc){return '<th><button data-t-ssort="'+sc.id+'" aria-pressed="'+(SX.sort===sc.id)+'" title="'+esc(sc.label+'. '+sc.blurb)+'">'+esc(sc.name.toUpperCase())+'</button></th>';}).join('');
  var body=rows.map(function(r){
    var tds=r.cells.map(function(c){return c?'<td class="c" style="background:'+heat(c.mdd)+'">'+pct1(c.mdd)+'</td>':'<td class="c" style="color:var(--muted)" title="Proxy data for part of this model does not reach back this far">n/a</td>';}).join('');
    var wc=r.ms?'<td class="c">'+pct1(r.ms.mdd)+'</td><td class="c">'+(r.ms.recover!=null?r.ms.recover+' mo':'not yet')+'</td>':'<td>—</td><td>—</td>';
    return '<tr'+(r.m.id==='_mkt'?' style="font-style:italic"':'')+'><td>'+(r.m.id==='_mkt'?'<b>'+esc(r.m.name)+'</b>':'<a href="#m-'+r.m.id+'"><b>'+esc(r.m.name)+'</b></a>')+'</td>'+tds+wc+'</tr>';}).join('');
  var mkt=MS['index'];
  return head('Stress Test.','Every model against six real market crashes.','<div class="tl-steps"><span><b>Step 2</b> Feel the risk</span></div>')+
   '<div class="stack"><div class="panel sh tl-hm"><div class="tw"><table><thead><tr><th>MODEL</th>'+hdr+'<th><button data-t-ssort="all" aria-pressed="'+(SX.sort==='all')+'">WORST SINCE 1992</button></th><th>RECOVERY</th></tr></thead><tbody>'+body+'</tbody></table></div>'+
   note('Each cell is the biggest fall from a peak while that crash played out. Darker means a bigger fall. Click a column to sort. <b>n/a</b> means the model holds something whose proxy history starts later (international stocks from 1990, commodities from 1992, gold from 1971). Recovery counts months from the worst point back to the prior high since 1992. '+histNote())+'</div></div></div>';
}

/* ================= IMPLEMENT IT ================= */
var IM={m:'index',amt:1000,frac:true,have:''};
function parseHold(txt){
  var out={},tot=0;
  (txt||'').split(/\n|;/).forEach(function(line){
    var m=line.match(/^\s*\$?([A-Za-z][A-Za-z.\-]{0,5})[\s:,\t]+\$?\s*([\d,]*\.?\d+)\s*%?/);if(!m)return;
    var t=m[1].toUpperCase(),v=parseFloat(m[2].replace(/,/g,''));if(!(v>0))return;out[t]=(out[t]||0)+v;tot+=v;});
  return {map:out,total:tot};
}
function priceOf(t){var d=ML.data();return d&&d.tickers&&d.tickers[t]?d.tickers[t].last:null;}
function planText(m,rows,amt){
  var s='ModelLab plan: '+m.name+' with '+money(amt)+'\n';
  rows.forEach(function(r){s+=r.t+'  '+r.w+'%  '+money(r.usd)+(r.sh!=null?'  ~'+r.sh+' shares':'')+'\n';});
  return s+'Educational only, not investment advice.';
}
function viewImplement(arg){
  if(arg&&ML.byId[arg]){IM.m=arg;}
  if(!ML.unlocked())return gateView('Implement It','Turn a model into exact dollar amounts and share counts.','Your plan, ready to act on.','implement');
  var m=ML.byId[IM.m],amt=Number(IM.amt)||0,have=parseHold(IM.have),cashIn=amt,total=have.total+cashIn;
  var tgtTot=have.total>0?total:amt;
  var rows=m.hold.map(function(x){
    var t=x[0],p=priceOf(t),tgt=tgtTot*x[2]/100,cur=have.map[t]||0,diff=have.total>0?tgt-cur:tgt,sh=null;
    if(p){sh=IM.frac?Math.round(diff/p*10000)/10000:Math.trunc(diff/p);}
    return {t:t,name:x[1],w:x[2],usd:diff,tgt:tgt,cur:cur,p:p,sh:sh};
  });
  var extra=Object.keys(have.map).filter(function(t){return !m.hold.some(function(x){return x[0]===t;});});
  var spent=rows.reduce(function(a,r){return a+(r.p&&!IM.frac&&r.sh>0?r.sh*r.p:Math.max(r.usd,0));},0);
  var tbl='<div class="tw"><table><thead><tr><th>HOLDING</th><th>TARGET</th>'+(have.total>0?'<th>YOU HAVE</th><th>ACTION</th>':'<th>AMOUNT</th>')+'<th>PRICE</th><th>SHARES</th></tr></thead><tbody>'+rows.map(function(r){
    var act=have.total>0?'<td>'+(Math.abs(r.usd)<1?'On target':(r.usd>0?'<span class="up">Buy '+money(r.usd)+'</span>':'<span class="dn">Sell '+money(-r.usd)+'</span>'))+'</td>':'';
    return '<tr><td><div class="hn"><div><b>'+esc(r.t)+'</b><span>'+esc(r.name)+'</span></div></div></td><td class="m">'+r.w+'% · '+money(r.tgt)+'</td>'+(have.total>0?'<td>'+money(r.cur)+'</td>'+act:'<td>'+money(r.usd)+'</td>')+'<td>'+(r.p?'$'+r.p.toFixed(2):'n/a')+'</td><td class="m">'+(r.sh!=null?(IM.frac?r.sh.toFixed(4):(r.sh>0?'+':'')+r.sh):'—')+'</td></tr>';}).join('')+'</tbody></table></div>';
  var unpriced=rows.filter(function(r){return !r.p;}).length;
  var tips=[['Buy','Place each purchase in the amounts above. Many brokers let you buy fractions of a share, which keeps the weights close to target.'],['Automate','Set up a recurring deposit so new money goes to whichever holdings are below target.'],['Rebalance','Once a year, or when a holding drifts a few points from its weight, trade back to the target. Use the rebalance calculator.'],['Leave it alone','Check on a schedule, not on headlines. Run the Pain Simulator first so you know what a bad year feels like.']];
  return head('Implement It.','Turn a model into dollar amounts, share counts and a rebalance plan.','<div class="tl-steps"><span><b>Step 3</b> Act</span></div>')+
   '<div class="stack"><div class="panel sh"><div class="tl-bar"><label class="tl-f">Model<select id="im-m">'+modelOpts(IM.m)+'</select></label><label class="tl-f">'+(have.total>0?'New money to add':'Amount to invest')+'<input id="im-amt" type="number" inputmode="numeric" min="0" step="100" value="'+IM.amt+'"></label>'+
   '<label class="tl-f">Shares<select id="im-frac"><option value="1"'+(IM.frac?' selected':'')+'>Fractional</option><option value="0"'+(!IM.frac?' selected':'')+'>Whole shares only</option></select></label></div>'+tbl+
   (unpriced?note(unpriced+' holding'+(unpriced>1?'s have':' has')+' no ticker (a sleeve you choose yourself); see the model page for the rule.'):'')+
   (!IM.frac&&have.total===0?'<div class="tl-ok">With whole shares you would spend about <b>'+money(spent)+'</b> of '+money(amt)+', leaving about <b>'+money(amt-spent)+'</b> in cash.</div>':'')+
   (extra.length?'<div class="tl-warn">Not in this model: '+esc(extra.join(', '))+'. They are left out of the trade list. Selling is your call.</div>':'')+
   '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px"><button class="btn pri sm" data-t-copy="1">Copy plan</button><button class="btn light sm" data-t-print="1">Print or save as PDF</button><a class="btn light sm" href="#m-'+m.id+'">About this model</a></div>'+note(srcLine()+' Prices are the latest close and will differ at the time you trade. Educational only, not investment advice.')+'</div>'+
   '<div class="two"><div class="panel"><h2 style="font-size:22px">Rebalance calculator</h2><p class="b" style="font-size:15px">Already own some? Paste ticker and dollar amount, one per line. We show what to buy or sell to reach the target.</p><label class="tl-f"><textarea id="im-have" placeholder="VTI 3000&#10;BND 800&#10;AAPL 500">'+esc(IM.have)+'</textarea></label></div>'+
   '<div class="panel" style="background:var(--yellow)"><h2 style="font-size:22px">Your routine</h2>'+tips.map(function(t,i){return '<div class="nstep"><i>'+(i+1)+'</i><span><b>'+t[0]+'.</b> '+esc(t[1])+'</span></div>';}).join('')+'</div></div></div></div>';
}

/* ================= OVERLAP CHECKER ================= */
var OV={txt:''};
function bucketOf(t){var id=H&&H.map[t];return id||'?';}
function viewOverlap(){
  if(hState!=='ready')return loadingView('Overlap Checker.','See which model you already resemble.');
  if(!ML.unlocked())return gateView('Overlap Checker','Paste what you own and see which model it resembles.','Know your concentration.','overlap');
  var u=parseHold(OV.txt),out='';
  if(u.total>0){
    var ts=Object.keys(u.map).map(function(t){return {t:t,w:u.map[t]/u.total};}).sort(function(a,b){return b.w-a.w;});
    var b={};ts.forEach(function(x){var k=bucketOf(x.t);b[k]=(b[k]||0)+x.w;});
    var unm=b['?']||0;
    var res=ML.MODELS.map(function(m){
      var mt={},mb={};m.hold.forEach(function(x){mt[x[0]]=(mt[x[0]]||0)+x[2]/100;var k=bucketOf(x[0]);mb[k]=(mb[k]||0)+x[2]/100;});
      var tick=0,sty=0;Object.keys(mt).forEach(function(t){if(u.map[t])tick+=Math.min(u.map[t]/u.total,mt[t]);});
      Object.keys(mb).forEach(function(k){if(k!=='?'&&b[k])sty+=Math.min(b[k],mb[k]);});
      return {m:m,tick:tick,sty:sty};
    }).sort(function(a,b2){return b2.sty-a.sty||b2.tick-a.tick;});
    var top3=ts.slice(0,3).reduce(function(a,x){return a+x.w;},0),bigB=Object.keys(b).filter(function(k){return k!=='?';}).sort(function(x,y){return b[y]-b[x];})[0];
    out='<div class="two"><div class="panel sh"><h2 style="font-size:22px">Closest models</h2><div class="tl-bars" style="margin-top:12px">'+res.slice(0,5).map(function(r){return '<div class="r"><a href="#m-'+r.m.id+'"><b>'+esc(r.m.name)+'</b></a><div class="t" title="Style overlap"><i style="width:'+(r.sty*100).toFixed(0)+'%"></i></div><span>'+(r.sty*100).toFixed(0)+'%</span></div>';}).join('')+'</div>'+
     note('Style overlap: how much of your money sits in the same kinds of assets as the model (for example, US large-cap value). Exact same tickers: best match is '+(res.slice().sort(function(a,b2){return b2.tick-a.tick;})[0].tick*100).toFixed(0)+'%.')+'</div>'+
     '<div class="panel sh"><h2 style="font-size:22px">Your concentration</h2><div class="tl-stats" style="margin-top:12px">'+
      statBox('HOLDINGS',ts.length,'')+statBox('LARGEST',(ts[0].w*100).toFixed(0)+'%',esc(ts[0].t),ts[0].w>0.25?'dn':'up')+statBox('TOP 3',(top3*100).toFixed(0)+'%','of your money',top3>0.6?'dn':'na')+(bigB?statBox('BIGGEST BUCKET',(b[bigB]*100).toFixed(0)+'%',esc(H.proxies[bigB].name)):'')+'</div>'+
      (ts[0].w>0.25?'<div class="tl-warn">'+esc(ts[0].t)+' is '+(ts[0].w*100).toFixed(0)+'% of what you entered. A single position that large can dominate your results.</div>':'')+
      (unm>0.001?note((unm*100).toFixed(0)+'% of your entry is in tickers we do not have history for, so it is not counted in the style overlap.'):'')+'</div></div>';
  }
  return head('Overlap Checker.','Paste what you own. See which model it already resembles.','<div class="tl-steps"><span><b>Step 3</b> Act</span></div>')+
   '<div class="stack"><div class="panel sh"><label class="tl-f">Your holdings (ticker and dollar amount, one per line)<textarea id="ov-txt" placeholder="VTI 5000&#10;SPY 2000&#10;AAPL 1000">'+esc(OV.txt)+'</textarea></label>'+note('Nothing you type leaves your browser. Percentages work too.')+'</div>'+out+'</div></div>';
}

/* ================= BUILD YOUR OWN ================= */
var BD={fee:0,real:false,rows:[['VTI',60],['BND',30],['GLD',10]],start:'1992-02',reb:'annual',cmp:'index',amt:10000,pick:''};
function tickerList(){return Object.keys(H.map).filter(function(t){return /^[A-Z.]{1,5}$/.test(t);});}
function viewBuild(){
  if(hState!=='ready')return loadingView('Build Your Own.','Test your own mix against history.');
  if(!ML.unlocked())return gateView('Build Your Own','Pick holdings and weights, then test them against history.','Your mix versus every model.','build');
  var tl=tickerList(),cm=ML.byId[BD.cmp],tot=BD.rows.reduce(function(a,r){return a+(Number(r[1])||0);},0);
  var s0=Math.max(startOf(BD.rows.map(function(r){return [r[0],r[1]||1];})),startOf(toH(cm))),want=HI[BD.start]!=null?HI[BD.start]:s0,g0=Math.max(want,s0),g1=HM.length-1;
  var mine=BD.rows.length?sim(BD.rows.map(function(r){return [r[0],Number(r[1])||0.0001];}),g0,g1,BD.amt,BD.reb):null;
  var other=sim(toH(cm),g0,g1,BD.amt,BD.reb),mk=sim([['VTI',100]],g0,g1,BD.amt,BD.reb);
  var cpiA=H&&H.cpi,realOk=!!(cpiA&&cpiA[g0-1]!=null&&cpiA[g1]!=null),realOn=BD.real&&realOk,fee=Math.max(0,Math.min(5,Number(BD.fee)||0))/100;
  if(mine&&fee)mine=mine.map(function(v,k){return v*Math.pow(1-fee,k/12);});
  if(realOn){var dfl=function(p){return p&&p.map(function(v,k){return v/(cpiA[g0-1+k]/cpiA[g0-1]);});};mine=dfl(mine);other=dfl(other);mk=dfl(mk);}
  var editor=BD.rows.map(function(r,i){return '<div class="tl-hold"><select data-t-brow="'+i+'" aria-label="Holding '+(i+1)+'">'+tl.map(function(t){return '<option'+(t===r[0]?' selected':'')+'>'+t+'</option>';}).join('')+'</select><input type="number" min="0" max="100" step="1" value="'+r[1]+'" data-t-bw="'+i+'" aria-label="Weight %"><button class="tl-x" data-t-bdel="'+i+'" aria-label="Remove holding">✕</button></div>';}).join('');
  var res='';
  if(mine){
    var a=pstats(mine),b=pstats(other),c=pstats(mk),labs=[];
    for(var i=0;i<=g1-g0+1;i++)labs.push(HM[g0-1+i]||'');
    var all=mine.concat(other,mk);
    res='<div id="bd-chart">'+chart({n:mine.length,labels:labs,series:[{vals:mk,color:'#dedee2',w:2},{vals:other,color:'#c5dcff',w:2.2},{vals:mine,color:'#4c90f7',w:3}],ymin:Math.min.apply(null,all)*0.9,ymax:Math.max.apply(null,all)*1.1,log:true,aria:'Growth of a custom portfolio versus a model',tick:function(l){return l.slice(0,4);}})+'</div>'+legend([['Your mix','#4c90f7'],[cm.name,'#c5dcff'],['US stock market','#dedee2']])+
     '<div class="tw" style="margin-top:14px"><table><thead><tr><th></th><th>YOUR MIX</th><th>'+esc(cm.name.toUpperCase())+'</th><th>US STOCKS</th></tr></thead><tbody>'+
     [['Ending value',function(s,p){return money(p[p.length-1]);}],['Per year (CAGR)',function(s){return s.cagr==null?'n/a':pct1(s.cagr);}],['Worst fall',function(s){return pct1(s.mdd);}],['Months to recover',function(s){return s.recover!=null?s.recover:(s.mdd<0?'not yet':'—');}],['Worst 12 months',function(s){return s.worst12==null?'n/a':pct1(s.worst12);}],['Best 12 months',function(s){return s.best12==null?'n/a':pct1(s.best12);}]].map(function(r){return '<tr><td>'+r[0]+'</td><td class="m">'+r[1](a,mine)+'</td><td>'+r[1](b,other)+'</td><td>'+r[1](c,mk)+'</td></tr>';}).join('')+'</tbody></table></div>';
  }
  var elig=BD.rows.every(function(r){return priceOf(r[0])!=null;})&&tot>0;
  return head('Build Your Own.','Pick holdings and weights. Test them against history.')+
   '<div class="stack"><div class="two" style="align-items:start"><div class="panel sh"><h2 style="font-size:22px">Your mix</h2><p class="note" style="margin:6px 0 14px">Weights add to '+tot+'%'+(Math.abs(tot-100)>0.5?' (they are scaled to 100% for the test)':'')+'.</p>'+editor+
   '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px"><button class="btn light sm" data-t-badd="1"'+(BD.rows.length>=8?' disabled':'')+'>+ Add holding</button><label class="sortw"><select id="bd-pre" aria-label="Start from a model"><option value="">Start from a model…</option>'+modelOpts('')+'</select></label></div>'+
   '<div class="tl-bar" style="margin-top:18px"><label class="tl-f">Start<input id="bd-start" type="month" min="1927-01" max="'+HM[HM.length-13]+'" value="'+BD.start+'"></label><label class="tl-f">Rebalance<select id="bd-reb"><option value="annual"'+(BD.reb==='annual'?' selected':'')+'>Every year</option><option value="none"'+(BD.reb==='none'?' selected':'')+'>Never</option></select></label><label class="tl-f">Compare with<select id="bd-cmp">'+modelOpts(BD.cmp)+'</select></label><label class="tl-f">Fee on your mix, % a year<input id="bd-fee" type="number" min="0" max="5" step="0.05" inputmode="decimal" value="'+BD.fee+'"></label><label class="tl-f">Dollars<select id="bd-real"><option value="0"'+(BD.real?'':' selected')+'>Nominal</option><option value="1"'+(BD.real?' selected':'')+(realOk?'':' disabled')+'>Today\u2019s dollars</option></select></label></div>'+(fee?'<p class="note">The fee is taken out of your mix only, so you can see its drag against the same holdings without it.</p>':'')+(realOn?'<p class="note">All three lines are adjusted for US consumer-price inflation (CPI-U, FRED).</p>':(BD.real?'<p class="note">Inflation adjustment needs a start in 1947 or later.</p>':''))+
   (g0>want?'<p class="note">Start moved to '+mlab(HM[g0])+', the first month all your holdings have data.</p>':'')+
   '<div style="margin-top:14px"><button class="btn pri sm" data-t-bjoin="1"'+(elig?'':' disabled')+'>Enter this on the Leaderboard →</button>'+(elig?'':'<p class="note">Leaderboard entries need every holding to have a current price.</p>')+'</div></div>'+
   '<div class="panel sh"><h2 style="font-size:22px">How it would have gone</h2><p class="note" style="margin:6px 0 10px">'+(mine?mlab(HM[g0])+' to '+mlab(HM[g1])+', starting with '+money(BD.amt)+'.':'Add a holding to begin.')+'</p>'+res+'</div></div>'+note(histNote())+'</div></div>';
}

/* ================= LEADERBOARD ================= */
var LBS={rows:null,err:null,loading:false,filter:'all',joinModel:'index',handle:'',custom:null,msg:''};
function lsGet(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function uuid(){return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){var r=Math.random()*16|0;return (c==='x'?r:(r&3|8)).toString(16);});}
function sha256(s){
  if(!window.crypto||!crypto.subtle)return Promise.resolve(s);
  return crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)).then(function(b){return Array.prototype.map.call(new Uint8Array(b),function(x){return ('0'+x.toString(16)).slice(-2);}).join('');});
}
function priced(hold){return hold.length>0&&hold.every(function(h){return priceOf(h[0])!=null;});}
function eligibleModels(){return ML.MODELS.filter(function(m){return priced(toH(m));});}
function lbReq(path,opt){
  opt=opt||{};opt.headers=Object.assign({apikey:LB.key,Authorization:'Bearer '+LB.key,'Content-Type':'application/json'},opt.headers||{});
  return fetch(LB.url+'/rest/v1/'+path,opt);
}
function lbLoad(){
  if(LBS.loading)return;
  if(!LB.url){LBS.rows=lsGet('ml_lb_local',[]);return;}
  LBS.loading=true;
  lbReq('leaderboard_public?select=*&order=joined_at.desc&limit=500').then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(j){LBS.rows=j;LBS.err=null;LBS.loading=false;ML.rerender();}).catch(function(){LBS.err='Could not load the leaderboard right now.';LBS.rows=[];LBS.loading=false;ML.rerender();});
}
function perf(row){
  var d=ML.data(),hold=row.holdings||[],ep=row.entry_prices||{},tot=0,ret=0;
  hold.forEach(function(h){tot+=h[1];});
  for(var i=0;i<hold.length;i++){var t=hold[i][0],cur=d&&d.tickers&&d.tickers[t]?d.tickers[t].last:null,e=ep[t];if(!cur||!e)return null;ret+=(h2(hold[i][1])/tot)*(cur/e-1);}
  var spy=d&&d.tickers&&d.tickers.SPY?d.tickers.SPY.last:null,es=ep.SPY,sr=(spy&&es)?spy/es-1:null;
  return {ret:ret,spy:sr,alpha:sr==null?null:ret-sr};
}
function h2(x){return Number(x)||0;}
function ageDays(row){return Math.floor((Date.now()-new Date(row.joined_at).getTime())/86400000);}
var MINAGE=14;
function lbRows(){
  var rows=(LBS.rows||[]).map(function(r){var p=perf(r);return {r:r,p:p,age:ageDays(r)};}).filter(function(x){return x.p;});
  if(LBS.filter!=='all')rows=rows.filter(function(x){return x.r.model_id===LBS.filter;});
  var ranked=rows.filter(function(x){return x.age>=MINAGE;}).sort(function(a,b){return b.p.ret-a.p.ret;}),fresh=rows.filter(function(x){return x.age<MINAGE;}).sort(function(a,b){return b.r.joined_at<a.r.joined_at?-1:1;});
  return {ranked:ranked,fresh:fresh};
}
function lbJoin(){
  var handle=(LBS.handle||'').trim(),hold,label,mid;
  if(!/^[A-Za-z0-9_]{3,20}$/.test(handle)){LBS.msg='Handle must be 3–20 letters, numbers or underscores.';ML.rerender();return;}
  if(LBS.custom){hold=LBS.custom.rows.map(function(r){return [r[0],Number(r[1])||0];}).filter(function(h){return h[1]>0;});label='Custom mix';mid='custom';}
  else{var m=ML.byId[LBS.joinModel];hold=toH(m);label=m.name;mid=m.id;}
  if(!priced(hold)){LBS.msg='Every holding needs a current price to enter.';ML.rerender();return;}
  var d=ML.data(),ep={};hold.forEach(function(h){ep[h[0]]=d.tickers[h[0]].last;});if(d.tickers.SPY)ep.SPY=d.tickers.SPY.last;
  var token=lsGet('ml_lb_token',null);if(!token){token=uuid();lsSet('ml_lb_token',token);}
  var row={handle:handle,label:label,model_id:mid,holdings:hold,entry_prices:ep,price_asof:d.asOf.slice(0,10),joined_at:new Date().toISOString()};
  LBS.msg='';
  if(!LB.url){
    var loc=lsGet('ml_lb_local',[]);if(loc.some(function(x){return x.handle.toLowerCase()===handle.toLowerCase();})){LBS.msg='That handle is taken on this device.';ML.rerender();return;}
    loc.push(row);lsSet('ml_lb_local',loc);LBS.rows=loc;LBS.msg='Saved on this device.';lsSet('ml_lb_me',handle);ML.rerender();return;
  }
  sha256(token).then(function(hash){
    return lbReq('entries',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({handle:handle,label:label,model_id:mid,holdings:hold,owner_hash:hash})});
  }).then(function(r){
    if(r.status===201||r.ok){lsSet('ml_lb_me',handle);LBS.rows=null;LBS.msg='You are on the board.';lbLoad();}
    else return r.json().then(function(j){LBS.msg=(j&&j.message)?j.message:'Could not join right now.';ML.rerender();});
  }).catch(function(){LBS.msg='Could not join right now.';ML.rerender();});
}
function viewLeaderboard(){
  if(!ML.unlocked())return gateView('Leaderboard','Track a virtual portfolio against everyone else.','Free to join, no real money.','leaderboard');
  if(LBS.rows==null)lbLoad();
  var data=LBS.rows==null?null:lbRows(),me=lsGet('ml_lb_me',null);
  var elig=eligibleModels(),cnt={};(LBS.rows||[]).forEach(function(r){cnt[r.model_id]=(cnt[r.model_id]||0)+1;});
  var chips=[['all','All']].concat(elig.map(function(m){return [m.id,m.name];})).map(function(c){return '<button class="chip" data-t-lbf="'+c[0]+'" aria-pressed="'+(LBS.filter===c[0])+'">'+esc(c[1])+(c[0]!=='all'&&cnt[c[0]]?' ('+cnt[c[0]]+')':'')+'</button>';}).join('');
  function tr(x,i,rank){var mine=me&&x.r.handle.toLowerCase()===me.toLowerCase();
    return '<tr'+(mine?' class="tl-me"':'')+'><td class="m">'+(rank?i+1:'—')+'</td><td><b>'+esc(x.r.handle)+'</b>'+(mine?' <span class="pill na">you</span>':'')+'</td><td>'+esc(x.r.label)+'</td><td class="m">'+ML.chg(x.p.ret*100,1)+'</td><td>'+(x.p.alpha==null?'n/a':ML.chg(x.p.alpha*100,1))+'</td><td>'+(x.age>=7?'🔥 ':'')+x.age+'d</td></tr>';}
  var table='';
  if(data){
    table=(data.ranked.length||data.fresh.length)?'<div class="tw"><table><thead><tr><th>#</th><th style="text-align:left">PLAYER</th><th style="text-align:left">PORTFOLIO</th><th>RETURN</th><th>VS SPY</th><th>STREAK</th></tr></thead><tbody>'+data.ranked.map(function(x,i){return tr(x,i,true);}).join('')+data.fresh.map(function(x,i){return tr(x,i,false);}).join('')+'</tbody></table></div>'+note('Ranked after '+MINAGE+' days so one lucky day cannot top the board. Newer entries are listed below the ranked ones. Return is price-only since the entry close; SPY is measured over the same window.'):'<p class="b" style="padding:12px 0">No entries yet. Be the first on the board.</p>';
  }else table='<p class="b" aria-busy="true">Loading the board…</p>';
  var recap='';
  if(data&&me){var all=data.ranked.concat(data.fresh),mi=-1;all.forEach(function(x,i){if(x.r.handle.toLowerCase()===me.toLowerCase())mi=i;});
    if(mi>-1){var x=all[mi],rk=mi<data.ranked.length?'#'+(mi+1)+' of '+data.ranked.length:'unranked until day '+MINAGE;
      recap='<div class="recap"><p class="rc-k">your recap</p><p class="rc-h">@'+esc(x.r.handle)+'</p><div class="rc-g"><div><small>held</small><b>'+(x.age>=7?'🔥 ':'')+x.age+' days</b></div><div><small>return</small><b>'+ML.fmt(x.p.ret*100,1)+'</b></div><div><small>vs spy</small><b>'+(x.p.alpha==null?'n/a':ML.fmt(x.p.alpha*100,1))+'</b></div><div><small>rank</small><b>'+rk+'</b></div></div><p class="rc-f">'+esc(x.r.label)+' · modellab leaderboard</p></div>';}}
  var myModels=elig.map(function(m){return '<option value="'+m.id+'"'+(m.id===LBS.joinModel&&!LBS.custom?' selected':'')+'>'+esc(m.name)+'</option>';}).join('');
  var join='<div class="panel sh"><h2 style="font-size:22px">Join the board</h2><p class="note" style="margin:6px 0 14px">Pick a model (or send one from Build Your Own). Your virtual portfolio starts at the latest close. Handles are public; use no personal details.</p>'+
   '<div class="tl-bar"><label class="tl-f">Handle<input id="lb-handle" maxlength="20" autocomplete="off" placeholder="e.g. steady_eddie" value="'+esc(LBS.handle)+'"></label>'+
   (LBS.custom?'<label class="tl-f">Portfolio<input value="Custom mix ('+LBS.custom.rows.map(function(r){return r[0];}).join(', ')+')" disabled></label><button class="chip" data-t-lbclear="1">Use a model instead</button>':'<label class="tl-f">Model<select id="lb-model">'+myModels+'</select></label>')+
   '<button class="btn pri" data-t-lbjoin="1">Join →</button></div>'+(LBS.msg?'<p class="note" role="status" style="margin:0">'+esc(LBS.msg)+'</p>':'')+'</div>';
  var local=!LB.url?'<div class="tl-soon"><span class="im in">the global board drops soon \uD83D\uDC40 for now your entry saves on this device, so you can still track your streak</span></div>':'';
  return head('Leaderboard.','Virtual portfolios from the latest close. No real money.','<div class="tl-steps"><span><b>Compete</b> Track against everyone</span></div>')+
   '<div class="stack">'+local+recap+join+'<div class="panel sh"><div class="tl-lbhead"><h2 style="font-size:22px">The board</h2></div><div class="chips" style="margin:12px 0 18px" role="group" aria-label="Filter by model">'+chips+'</div>'+(LBS.err?'<div class="tl-warn">'+esc(LBS.err)+'</div>':'')+table+'</div>'+
   note('For fun and learning. Hypothetical portfolios, price-only returns, not investment advice or a record of real performance. '+srcLine())+'</div></div>';
}

/* ================= model page: crash history as comments ================= */
ML.crashComments=function(m){
  ensureHist();
  var me=ML.handle(m),hav='<span class="av sm hist"><span>h</span></span>';
  var head='<div class="panel post cm"><div class="post-h">'+ML.av(m,'sm',true)+'<b>'+esc(me)+'</b><span>· crash history</span></div>';
  if(hState!=='ready')return head+'<p class="note">Loading real crash history…</p></div>';
  var rows=[],ms=MS[m.id];
  if(ms)rows.push(['since 1992','worst fall '+pct1(ms.mdd)+(ms.recover!=null?' · back to its old high in '+ms.recover+' months':' · not back to its old high yet')]);
  SCEN.forEach(function(sc){var c=stressCell(m,sc);if(c)rows.push([sc.name.toLowerCase(),'fell '+pct1(c.mdd)+' at the worst · '+pct1(c.tot)+' by '+mlab(sc.to)]);});
  var reply=ms?(ms.mdd<-0.4?'that is a lot of pain. could you hold through it?':(ms.mdd<-0.2?'real dips, but it came back.':'pretty calm, all things considered.')):'';
  return head+'<div class="cm-l">'+rows.map(function(r){return '<div class="cm-r">'+hav+'<p><b>@history</b> <span class="cm-y">'+esc(r[0])+'</span><br>'+esc(r[1])+'</p></div>';}).join('')+
   (reply?'<div class="cm-r reply">'+ML.av(m,'sm',true)+'<p><b>'+esc(me)+'</b> '+esc(reply)+'</p></div>':'')+'</div>'+
   '<a class="lk cm-more" href="#pain/'+m.id+'">live through one in the Pain Simulator →</a>'+note('Real history from long-run proxy series, rebalanced yearly, price only. Not the funds’ own returns.')+'</div>';
};

/* ================= model page hook ================= */
ML.modelTools=function(m){
  var emb='<iframe src="'+new URL('embed/'+m.id+'/',document.baseURI).href+'" title="'+esc(m.name)+' example portfolio" width="360" height="330" style="border:0;border-radius:16px" loading="lazy"></iframe>';
  return '<div class="panel sh" style="background:var(--mint)"><h2 style="font-size:22px">Try this model</h2><p class="b" style="font-size:15px;margin-top:6px">See how it behaves and what it would take to own it.</p><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px"><a class="btn pri sm" href="#pain/'+m.id+'">Pain Simulator</a><a class="btn light sm" href="#stress">Stress Test</a><a class="btn light sm" href="#implement/'+m.id+'">Implement It</a></div></div>'+
   '<div class="panel"><h2 style="font-size:22px">Embed this portfolio</h2><p class="b" style="font-size:15px;margin-top:6px">Put this example allocation on your own site or blog. It links back to ModelLab.</p><textarea class="tl-emb" readonly rows="3" aria-label="Embed code" onfocus="this.select()">'+esc(emb)+'</textarea><div style="margin-top:12px"><button class="btn light sm" data-t-copyemb="'+m.id+'">Copy embed code</button></div></div>';
};

/* ================= routes ================= */
ML.routes.tools={nav:'tools',view:viewTools};
ML.routes.match={nav:'tools',view:viewMatch,before:ensureHist};
ML.routes.pain={nav:'tools',view:viewPain,before:ensureHist,after:function(){if(P.timer)painPlay();}};
ML.routes.stress={nav:'tools',view:viewStress,before:ensureHist};
ML.routes.implement={nav:'tools',view:viewImplement};
ML.routes.overlap={nav:'tools',view:viewOverlap,before:ensureHist};
ML.routes.build={nav:'tools',view:viewBuild,before:ensureHist};
ML.routes.leaderboard={nav:'leaderboard',view:viewLeaderboard};
ML.routes.__leave=function(){painStop();};
if(ML.routeFor(ML.curH()))ML.rerender();

/* ================= events ================= */
/* ================= SHARE CARDS + QUIZ TAGGING ================= */
function wrapLines(g,text,maxW){var ws=String(text).split(' '),ls=[],cur='';ws.forEach(function(w){var t2=cur?cur+' '+w:w;if(g.measureText(t2).width>maxW&&cur){ls.push(cur);cur=w;}else cur=t2;});if(cur)ls.push(cur);return ls;}
function shareCard(c){
  return Promise.all([document.fonts.load('500 70px "Open Sauce"'),document.fonts.load('400 30px Inter')]).catch(function(){}).then(function(){
    var W=1200,Ht=630,cv=document.createElement('canvas');cv.width=W;cv.height=Ht;var g=cv.getContext('2d');
    g.fillStyle='#fff';g.fillRect(0,0,W,Ht);
    function rr(x,y,w,h,r,fill){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();g.fillStyle=fill;g.fill();}
    g.save();g.translate(64,56);g.scale(2.1,2.1);g.strokeStyle='#0a0a0a';g.lineWidth=2.2;g.lineCap='round';g.stroke(new Path2D('M3 5C10 5 12 17 21 17C31 17 33 4 45 4'));g.fillStyle='#0a0a0a';g.beginPath();g.arc(3,5,2.6,0,7);g.fill();g.beginPath();g.arc(45,4,2.6,0,7);g.fill();g.restore();
    g.fillStyle='#0a0a0a';g.font='500 34px "Open Sauce",Inter,sans-serif';g.textBaseline='alphabetic';g.fillText('modellab',186,95);
    if('letterSpacing' in g)g.letterSpacing='-2px';
    var fs=68;g.font='500 '+fs+'px "Open Sauce",Inter,sans-serif';while(g.measureText(c.soft).width>590&&fs>40){fs-=2;g.font='500 '+fs+'px "Open Sauce",Inter,sans-serif';}
    g.fillStyle='#707070';g.fillText(c.soft,64,270);
    g.fillStyle='#0a0a0a';var ml=wrapLines(g,c.main,590).slice(0,2);ml.forEach(function(l,i){g.fillText(l,64,270+(fs+8)*(i+1));});
    if('letterSpacing' in g)g.letterSpacing='0px';
    g.font='400 30px Inter,sans-serif';
    var gl=wrapLines(g,c.gray,390),bl=wrapLines(g,c.blue,390);
    var gh=gl.length*40+36,gy=150;rr(720,gy,430,gh,36,'#dedee2');g.fillStyle='#0a0a0a';gl.forEach(function(l,i){g.fillText(l,744,gy+50+i*40);});
    var bh=bl.length*40+36,by=gy+gh+28;rr(700,by,430,bh,36,'#4c90f7');g.fillStyle='#fff';bl.forEach(function(l,i){g.fillText(l,724,by+50+i*40);});
    g.fillStyle='#707070';g.font='400 24px Inter,sans-serif';g.fillText(c.foot||'Educational only, not investment advice.',64,570);
    g.textAlign='right';g.fillStyle='#0a0a0a';g.font='500 26px "Open Sauce",Inter,sans-serif';g.fillText(c.url||'',1136,570);g.textAlign='left';
    return new Promise(function(res){cv.toBlob(function(b){res(b);},'image/png');});
  });
}
function shareOut(blob,name,text,url){
  var f;try{f=new File([blob],name,{type:'image/png'});}catch(e){}
  if(f&&navigator.canShare&&navigator.canShare({files:[f]})){return navigator.share({files:[f],text:text,url:url}).catch(function(){});}
  var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},1000);
}
function shortUrl(path){return new URL(path,document.baseURI).href.replace(/^https?:\/\//,'').replace(/\/$/,'');}
function painCard(){
  var m=ML.byId[P.m],st=pstats(P.idx),you=P.dec?painYou():P.hold,fy=you[P.len],sc=SCEN.filter(function(s){return s.id===P.sc;})[0];
  var when=sc?'before the '+sc.name.toLowerCase()+'.':'in '+mlab(HM[P.g0-1])+'.';
  var blue=P.dec==='sell'?'i sold at '+pct1(painDD(P.idx,P.decK))+'. ended with '+money(fy)+'.':(P.dec==='buy'?'i bought more. ended with '+money(fy)+'.':(P.dec==='hold'?'i held. ended with '+money(fy)+'.':'it never fell 15%. ended with '+money(fy)+'.'));
  return {soft:'i invested '+money(P.amt),main:when,gray:m.name.toLowerCase()+' fell '+pct1(st.mdd)+' at its worst.',blue:blue,url:shortUrl('tools/pain/')};
}
function painLink(){return new URL('tools/pain/?m='+encodeURIComponent(P.m)+'&s='+encodeURIComponent(P.sc),document.baseURI).href;}
function matchCard(){var r=matchRank().slice(0,3);return {soft:'my investing style',main:r[0].m.name.toLowerCase()+'.',gray:'also fits: '+r.slice(1).map(function(x){return x.m.name.toLowerCase();}).join(', ')+'.',blue:'what would you hold when it drops?',url:shortUrl('tools/match/')};}
function progGet(){try{return JSON.parse(localStorage.getItem('ml_prog')||'{}');}catch(e){return {};}}
function markProg(k){var p=progGet();if(p[k])return;p[k]=1;try{localStorage.setItem('ml_prog',JSON.stringify(p));}catch(e){}}
function emailSaved(){try{return !!localStorage.getItem('ml_email');}catch(e){return false;}}
function qzSave(){
  try{localStorage.setItem('ml_match',matchRank()[0].m.id);}catch(e){}
  var em;try{em=localStorage.getItem('ml_email');}catch(e){}
  var S=ML.signup;if(!em||!S||!S.companyId||Q.saved)return;Q.saved=1;
  var r=matchRank().slice(0,3).map(function(x){return x.m.id;});
  fetch('https://a.klaviyo.com/client/profiles/?company_id='+encodeURIComponent(S.companyId),{method:'POST',headers:{'Content-Type':'application/json',revision:'2024-10-15'},body:JSON.stringify({data:{type:'profile',attributes:{email:em,properties:{modellab_top_match:r[0],modellab_matches:r.join(',')}}}})}).catch(function(){});
}
function copyTxt(txt,el){
  function ok(){if(el){var o=el.textContent;el.textContent='Copied ✓';setTimeout(function(){el.textContent=o;},1600);}}
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(ok,function(){window.prompt('Copy this link',txt);});else window.prompt('Copy this link',txt);
}
function painQuery(){
  if(P._q)return;P._q=1;var q;try{q=new URLSearchParams(location.search);}catch(e){return;}
  if(q.get('m')&&ML.byId[q.get('m')])P.m=q.get('m');
  var s=q.get('s');if(s&&(SCEN.some(function(x){return x.id===s;})||/^\d{4}-\d{2}$/.test(s)))P.sc=s;
}

function cap(e,sel){return e.target.closest&&e.target.closest(sel);}
document.addEventListener('click',function(e){
  var shb=cap(e,'[data-t-share]');if(shb){var kind=shb.getAttribute('data-t-share'),card=kind==='pain'?painCard():matchCard(),o=shb.textContent;shb.textContent='Making image…';shb.disabled=true;
    shareCard(card).then(function(b){shb.textContent=o;shb.disabled=false;shareOut(b,'modellab-'+kind+'.png',kind==='pain'?'I tried the ModelLab pain simulator. Can you hold?':'My ModelLab investing style match.',kind==='pain'?painLink():new URL('tools/match/',document.baseURI).href);});return;}
  var lkb=cap(e,'[data-t-link]');if(lkb){copyTxt(lkb.getAttribute('data-t-link')==='pain'?painLink():new URL('tools/match/',document.baseURI).href,lkb);return;}
  var el;
  if((el=cap(e,'[data-t-q]'))){var j=Number(el.getAttribute('data-t-q'));Q.a[Q.i]=QZ[Q.i].a[j][1];if(Q.i<QZ.length-1)Q.i++;else Q.done=true;if(Q.done){markProg('match');}ML.rerender();if(Q.done)qzSave();return;}
  if(cap(e,'[data-t-qback]')){Q.i=Math.max(0,Q.i-1);Q.a.length=Q.i;ML.rerender();return;}
  if(cap(e,'[data-t-qreset]')){Q={i:0,a:[],done:false,saved:0};ML.rerender();return;}
  if((el=cap(e,'[data-t-psc]'))){if(el.disabled)return;P.sc=el.getAttribute('data-t-psc');painReset();ML.rerender();return;}
  if(cap(e,'[data-t-pplay]')){if(!P.hold)return;if(P.pause!=null&&P.k===P.pause&&P.dec==null)return;if(P.done){painReset();}painPlay();return;}
  if(cap(e,'[data-t-pskip]')){if(!P.hold)return;painStop();P.k=P.len;P.done=true;if(P.pause!=null&&P.dec==null){P.dec='hold';P.decK=P.pause;}ML.rerender();return;}
  if((el=cap(e,'[data-t-pdec]'))){P.dec=el.getAttribute('data-t-pdec');P.decK=P.k;painPlay();return;}
  if(cap(e,'[data-t-prestart]')){painReset();ML.rerender();window.scrollTo(0,0);return;}
  if((el=cap(e,'[data-t-ssort]'))){SX.sort=el.getAttribute('data-t-ssort');ML.rerender();return;}
  var ce=cap(e,'[data-t-copyemb]');if(ce){var ta=document.querySelector('.tl-emb');if(ta)copyTxt(ta.value,ce);return;}
  if(cap(e,'[data-t-print]')){markProg('implement');window.print();return;}
  if(cap(e,'[data-t-copy]')){markProg('implement');
    var m=ML.byId[IM.m],amt=Number(IM.amt)||0,rows=m.hold.map(function(x){var p=priceOf(x[0]),usd=amt*x[2]/100;return {t:x[0],w:x[2],usd:usd,sh:p?Math.round(usd/p*10000)/10000:null};});
    var txt=planText(m,rows,amt),b=cap(e,'[data-t-copy]');
    (navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(function(){b.textContent='Copied ✓';}).catch(function(){b.textContent='Copy failed';});return;}
  if(cap(e,'[data-t-badd]')){BD.rows.push(['VTI',0]);ML.rerender();return;}
  if((el=cap(e,'[data-t-bdel]'))){BD.rows.splice(Number(el.getAttribute('data-t-bdel')),1);ML.rerender();return;}
  if(cap(e,'[data-t-bjoin]')){LBS.custom={rows:BD.rows.map(function(r){return [r[0],r[1]];})};ML.go('#leaderboard');return;}
  if((el=cap(e,'[data-t-lbf]'))){LBS.filter=el.getAttribute('data-t-lbf');ML.rerender();return;}
  if(cap(e,'[data-t-lbclear]')){LBS.custom=null;ML.rerender();return;}
  if(cap(e,'[data-t-lbjoin]')){lbJoin();return;}
});
document.addEventListener('change',function(e){
  var t=e.target,id=t.id;
  if(id==='pn-m'){P.m=t.value;painReset();ML.rerender();}
  else if(id==='pn-date'&&/^\d{4}-\d{2}$/.test(t.value)&&HI[t.value]!=null){P.sc=t.value;painReset();ML.rerender();}
  else if(id==='im-m'){IM.m=t.value;ML.rerender();}
  else if(id==='im-frac'){IM.frac=t.value==='1';ML.rerender();}
  else if(id==='bd-pre'&&t.value){var m=ML.byId[t.value];BD.rows=m.hold.map(function(x){return [x[0],x[2]];}).filter(function(r){return H&&H.map[r[0]]&&/^[A-Z.]{1,5}$/.test(r[0]);});ML.rerender();}
  else if(id==='bd-reb'){BD.reb=t.value;ML.rerender();}
  else if(id==='bd-real'){BD.real=t.value==='1';ML.rerender();}
  else if(id==='bd-fee'){BD.fee=Math.max(0,Math.min(5,Number(t.value)||0));ML.rerender();}
  else if(id==='bd-cmp'){BD.cmp=t.value;ML.rerender();}
  else if(id==='bd-start'&&/^\d{4}-\d{2}$/.test(t.value)){BD.start=t.value;ML.rerender();}
  else if(id==='lb-model'){LBS.joinModel=t.value;}
  else if(t.hasAttribute&&t.hasAttribute('data-t-brow')){BD.rows[Number(t.getAttribute('data-t-brow'))][0]=t.value;ML.rerender();}
  else if(t.hasAttribute&&t.hasAttribute('data-t-bw')){BD.rows[Number(t.getAttribute('data-t-bw'))][1]=Number(t.value)||0;ML.rerender();}
});
document.addEventListener('input',function(e){
  var t=e.target;
  if(t.id==='pn-amt'){P.amt=Math.max(100,Number(t.value)||10000);}
  else if(t.id==='pn-contrib'){P.contrib=Math.max(0,Math.min(100000,Number(t.value)||0));}
  else if(t.id==='im-amt'){IM.amt=Math.max(0,Number(t.value)||0);clearTimeout(viewImplement._t);viewImplement._t=setTimeout(ML.rerender,350);}
  else if(t.id==='im-have'){IM.have=t.value;clearTimeout(viewImplement._h);viewImplement._h=setTimeout(function(){var s=t.selectionStart;ML.rerender();var n=$('#im-have');if(n){n.focus();try{n.setSelectionRange(s,s);}catch(x){}}},500);}
  else if(t.id==='ov-txt'){OV.txt=t.value;clearTimeout(viewOverlap._t);viewOverlap._t=setTimeout(function(){var s=t.selectionStart;ML.rerender();var n=$('#ov-txt');if(n){n.focus();try{n.setSelectionRange(s,s);}catch(x){}}},500);}
  else if(t.id==='lb-handle'){LBS.handle=t.value;}
});
document.addEventListener('change',function(e){if(e.target.id==='pn-contrib'){P.contrib=Math.max(0,Math.min(100000,Number(e.target.value)||0));painReset();ML.rerender();return;}if(e.target.id==='pn-amt'){P.amt=Math.max(100,Number(e.target.value)||10000);painReset();ML.rerender();}});
})();
