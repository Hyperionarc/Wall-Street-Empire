// Bot « bon joueur » Playwright : MODE=round|s1..s5 LEV=0.45 EVERY=4 IDLE=0 CASTE=industriel node bot_round.js (NODE_PATH=$(npm root -g)) ; imprime la valorisation tous les 10 % du temps
const { chromium } = require('playwright'); const fs=require('fs');
const URL=process.env.WSE_URL||'file://'+require('path').resolve(__dirname,'..','city.html');
const E=process.env, mode=E.MODE||'round', lev=+(E.LEV||0.45), every=+(E.EVERY||4), idle=+(E.IDLE||0), caste=E.CASTE||'industriel', noEv=(E.NOEV||'1')==='1', maxMul=+(E.MAXMUL||1.6);
const botSrc=fs.readFileSync(__dirname+'/bot_lib.js','utf8');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1280,height:900}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('dialog',d=>d.dismiss());
 await p.goto(URL); await p.waitForTimeout(600);
 const D=await p.evaluate(([mode,caste,noEv,lev,idle,src,tgt,prof])=>{ const W=window.WSE; if(tgt&&W.SCN[mode]){W.SCN[mode].tgt=tgt; W.SCN[mode].req=null; W.SCN[mode].ms=[];} W.startMode(mode); const S=W.S; S.noEv=noEv; W.setCaste(caste); document.getElementById('caste').hidden=true; document.getElementById('hint').hidden=true; document.getElementById('endscr').hidden=true; S.mode.w0=S.cash; (0,eval)(src); window.BOT.P.lev=lev; window.BOT.P.idle=idle; Object.assign(window.BOT.P, JSON.parse(prof||'{}')); return {D:W.modeDays(),tgt:S.mode.k}; },[mode,caste,noEv,lev,idle,botSrc,+(E.TGT||0),E.PROF||'{}']);
 const ROUND=D.D; console.log('mode',mode,'roundDays',ROUND,'lev',lev,'every',every,'idle',idle);
 let nextMark=0, t0=Date.now();
 while(true){
  const r=await p.evaluate((every)=>{ const W=window.WSE,S=W.S; const t=S.day+10; while(S.day<t && !S.mode.done){ for(let j=0;j<every;j++) W.step(); window.BOT.tick(); } const F=S.fin||{};
    return {day:S.day,done:S.mode.done,val:Math.round(W.valuation()),cash:Math.round(S.cash),loan:Math.round(S.loan||0),net:Math.round(F.net||0),pop:Math.round(S.pop),unemp:+S.stats.unemp.toFixed(3),diff:S.diff,exp:Math.round(W.expectedVal(S.day)),rk:W.rankPlayers().join('/'),cnt:Object.entries(window.BOT.cnt).filter(e=>e[0].slice(0,2)!=='x_').map(e=>e[0]+e[1]).join(' '),rate:+(W.loanRateNow()*100).toFixed(1),lim:Math.round(W.creditLimit())}; },every);
  if(r.day>=nextMark){ console.log((Math.round(r.day/ROUND*100)+'%').padStart(5),JSON.stringify(r)); nextMark+=ROUND*0.1; }
  if(r.done||r.day>=ROUND*maxMul){ console.log('FIN',JSON.stringify(r),'minutes@x1',(r.day*0.75/60).toFixed(1),'ms',Date.now()-t0); break; }
 }
 console.log('errs',errs.slice(0,5)); await b.close(); })();
