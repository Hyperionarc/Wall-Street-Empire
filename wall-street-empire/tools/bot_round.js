// Bot Playwright (passe 17) : MODE=round|s1..s5 PROFILE=bon|rapide|lent|casual node bot_round.js  (NODE_PATH=$(npm root -g) ; WSE_URL=file://.../city.html pour une autre version)
// Imprime la valorisation tous les 10 % du temps (tableau de la courbe de fortune) et la durée réelle à vitesse ×1.
// Profils : bon (levier 45 %, agit tous les 4 jours), rapide (levier 55 %, tous les 2 jours, seuils bas), lent (levier 35 %, agit 1 jour sur 8, 25 % de jours perdus), casual (levier 25 %, jours perdus 50 %).
// La partie est mise en pause (vitesse 0) : seul le bot fait avancer les jours, ce qui rend chaque profil reproductible.
// Surcharges : LEV, EVERY, IDLE, PROF='{"fam":[...],"hurdle":0.05}', TGT (objectif forcé), CASTE, NOEV=1.
const { chromium } = require('playwright'); const fs=require('fs');
const URL=process.env.WSE_URL||'file://'+require('path').resolve(__dirname,'..','city.html');
const E=process.env, mode=E.MODE||'round', caste=E.CASTE||'industriel', noEv=(E.NOEV||'1')==='1', maxMul=+(E.MAXMUL||1.6);
const SV=['s1','s2','s3','tech','dc','bank','off'];
const PRESET={
  bon:    { lev:0.45, every:4,  idle:0,    p:{ hurdle:0.05 } },
  rapide: { lev:0.55, every:2,  idle:0,    p:{ hurdle:0.03, mature:28, maxPerTick:8, demC:{ s1:0.5, s2:0.45, s3:0.3, s4:0.35 } } },
  lent:   { lev:0.35, every:8,  idle:0.25, p:{ hurdle:0.08, mature:45 } },
  casual: { lev:0.25, every:12, idle:0.5,  p:{ hurdle:0.10, mature:50 } }
};
// familles par mode : les verrous du scénario sont de toute façon respectés par le bot (modeLocked)
const BYMODE={
  round:{ fam:SV, bourse:false },
  s1:{ fam:['s1','s2','s3'], bourse:false },
  s2:{ fam:['s1','s2','s3','off'], bourse:false, chain:true },
  s3:{ fam:['s1','s2','s3','tech','dc','off'], bourse:false, exportTarget:1700000 },
  s4:{ fam:SV, bourse:true, subs:1 },
  s5:{ fam:SV, bourse:true, subs:2 }
};
const pre=PRESET[E.PROFILE||'bon']||PRESET.bon;
const lev=+(E.LEV||pre.lev), every=+(E.EVERY||pre.every), idle=+(E.IDLE!=null?E.IDLE:pre.idle);
const prof=Object.assign({}, BYMODE[mode]||BYMODE.round, pre.p, JSON.parse(E.PROF||'{}'));
const botSrc=fs.readFileSync(__dirname+'/bot_lib.js','utf8');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1280,height:900}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('dialog',d=>d.dismiss());
 await p.goto(URL); await p.waitForTimeout(600);
 const D=await p.evaluate(([mode,caste,noEv,lev,idle,src,tgt,prof])=>{ const W=window.WSE; if(tgt&&W.SCN[mode]){W.SCN[mode].tgt=tgt; W.SCN[mode].req=null; W.SCN[mode].ms=[];} W.startMode(mode); const S=W.S; S.noEv=noEv; W.setCaste(caste); W.setSpeed(0); document.getElementById('caste').hidden=true; document.getElementById('hint').hidden=true; document.getElementById('endscr').hidden=true; S.mode.w0=S.cash; (0,eval)(src); window.BOT.P.lev=lev; window.BOT.P.idle=idle; Object.assign(window.BOT.P, prof); return {D:W.modeDays(),tgt:S.mode.k}; },[mode,caste,noEv,lev,idle,botSrc,+(E.TGT||0),prof]);
 const ROUND=D.D; console.log('mode',mode,'profile',E.PROFILE||'bon','roundDays',ROUND,'lev',lev,'every',every,'idle',idle);
 let nextMark=0, t0=Date.now();
 while(true){
  const r=await p.evaluate((every)=>{ const W=window.WSE,S=W.S; const t=S.day+10; while(S.day<t && !S.mode.done){ for(let j=0;j<every;j++) W.step(); window.BOT.tick(); } const F=S.fin||{};
    return {day:S.day,done:S.mode.done,val:Math.round(W.valuation()),cash:Math.round(S.cash),loan:Math.round(S.loan||0),net:Math.round(F.net||0),pop:Math.round(S.pop),unemp:+S.stats.unemp.toFixed(3),diff:S.diff,exp:Math.round(W.expectedVal(S.day)),rk:W.rankPlayers().join('/'),cnt:Object.entries(window.BOT.cnt).filter(e=>e[0].slice(0,2)!=='x_').map(e=>e[0]+e[1]).join(' '),rate:+(W.loanRateNow()*100).toFixed(1),lim:Math.round(W.creditLimit())}; },every);
  if(r.day>=nextMark){ console.log((Math.round(r.day/ROUND*100)+'%').padStart(5),JSON.stringify(r)); nextMark+=ROUND*0.1; }
  if(r.done||r.day>=ROUND*maxMul){ console.log('FIN',JSON.stringify(r),'minutes@x1',(r.day*0.75/60).toFixed(1),'ms',Date.now()-t0); break; }
 }
 console.log('errs',errs.slice(0,5)); await b.close(); })();
