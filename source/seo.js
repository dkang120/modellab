/* Per-route title and description. Used by the browser (index.html) and by scripts/build_pages.mjs. */
(function(root){
var D={
 home:['ModelLab: your personalized investing tool','Explore investing philosophies as example portfolios, with price snapshots, a dollar calculator and side-by-side comparisons. Educational only.'],
 library:['Investing model library | ModelLab','Browse investing styles like index, value, growth, dividend and all-weather, each with an example portfolio. Educational only.'],
 compare:['Compare investing models side by side | ModelLab','Compare up to four investing models on risk, effort, growth and holdings, and find the style that fits you. Educational only.'],
 tools:['Investing tools: quiz, pain simulator, stress test | ModelLab','Match a model to how you behave, live through a real market crash, then get a plan you can act on. Educational only.'],
 match:['Investing style quiz | ModelLab','Six questions about how you would actually behave, matched to the investing models that fit. Educational only.'],
 pain:['Pain simulator: invest before a crash | ModelLab','Invest right before a real crash and decide in real time whether to sell, hold or buy more. Educational only.'],
 stress:['Stress test: every model against six crashes | ModelLab','See how each investing model fell in the dot-com bust, 2008, covid and more, side by side. Educational only.'],
 implement:['Implement it: dollar amounts and rebalance plan | ModelLab','Turn an investing model into exact dollar amounts, share counts and a rebalance plan. Educational only.'],
 overlap:['Portfolio overlap checker | ModelLab','Paste what you own and see which model it resembles and where you are concentrated. Educational only.'],
 build:['Build your own portfolio and test it | ModelLab','Pick holdings and weights, test them against decades of history and compare with any model. Educational only.'],
 goal:['Goal simulator: run your plan 1,000 ways | ModelLab','Monte Carlo simulator for investing goals. See the typical, rough and good outcomes for any model, with editable assumptions. Educational only.'],
 now:['Now what? What to do with the money you have | ModelLab','Tell us what you have, get the order of moves most people in your spot consider, plus the investing model that fits. Educational, not advice.'],
 text:['Text buddy: an investing accountability partner | ModelLab','Free texts from ModelLab that check in when markets get wild, so you stay locked in. Educational only, not investment advice.'],
 'sms-terms':['SMS Terms: ModelLab Text Buddy | ModelLab','Terms for ModelLab Text Buddy text messages: what we send, how often, cost, and how to reply STOP or HELP.'],
 data:['Your data | ModelLab','See what ModelLab stores about you, copy it, or delete it. Email, phone and on-device data explained.'],
 privacy:['Privacy Policy | ModelLab','How ModelLab collects, uses and protects your email, mobile number and other information.'],
 about:['About ModelLab','ModelLab is an educational project that shows investing philosophies as example portfolios. Not investment advice.']
};
function seoFor(h,M){
  h=(h||'#home').replace(/^#/,'')||'home';
  if(h.indexOf('m-')===0){var m=(M||[]).filter(function(x){return x.id===h.slice(2);})[0];
    if(m)return {title:m.name+' investing model: example portfolio | ModelLab',desc:m.tag+' See the belief, the rules and an example allocation. Educational only.'};}
  var d=D[h.split('/')[0]]||D.home;return {title:d[0],desc:d[1]};
}
// Plain-language FAQ per model. Shown on the model page and emitted as FAQPage schema by the build.
function lc(t){t=String(t).replace(/\.$/,'');return t.charAt(0).toLowerCase()+t.slice(1);}
var RL=['','very low','low','medium','high','very high'];
function faqFor(m){
  return [
    ['What is the '+m.name+' investing model?',m.belief],
    ['How risky is '+m.name+'?','ModelLab rates it '+m.risk+'/5 for risk and '+m.effort+'/5 for effort ('+RL[m.risk]+' risk, '+RL[m.effort]+' effort), with a suggested horizon of '+m.horizon+'. Ratings are editorial and compare styles with each other, not a prediction.'],
    ['When does '+m.name+' work best?','Historically it has done best in '+lc(m.best)+'.'],
    ['When does '+m.name+' struggle?','It has had the hardest time in '+lc(m.worst)+'.'],
    ['Where does the idea come from?',m.origin],
    ['Is this investment advice?','No. The example portfolio is hypothetical and for education only. It shows what the style looks like with public funds; it is not a recommendation to buy or sell anything.']
  ];
}
root.seoFor=seoFor;root.faqFor=faqFor;if(typeof module!=='undefined')module.exports={seoFor:seoFor,faqFor:faqFor};
})(typeof window!=='undefined'?window:globalThis);
