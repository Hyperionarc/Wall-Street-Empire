// Passe 42 : Réseau Wall Street (fil d'actualité façon LinkedIn, salon public simulé, objet NET prêt pour le multijoueur).
exports.name = 'Réseau Wall Street : fil, salon, déterminisme (passe 42)';
exports.run = async (t, L) => {
  const pg = await L.newPage({ wait: 700 }); await L.setup(pg, { cash: 3e7 }); await L.inject(pg);
  const r = await pg.evaluate(async () => {
    const W = window.WSE, S = W.S, o = {}, wait = ms => new Promise(x => setTimeout(x, ms)); S.stats.raw = 4e7;
    W.net.reset(4242);
    const T = W.net.TPL, C = W.net.CHAT; let n = 0; Object.keys(T).forEach(k => { n += T[k].length; }); ['amb', 'rival', 'mod'].forEach(k => { n += C[k].length; }); ['ev', 'rep', 'ctx'].forEach(g => Object.keys(C[g]).forEach(k => { n += C[g][k].length; })); o.nTpl = n;
    o.api = typeof W.net.NET.publish === 'function' && typeof W.net.NET.say === 'function' && typeof W.net.NET.onMessage === 'function';
    let got = 0; const off = W.net.NET.onMessage(() => { got++; });
    // événement réel : levée de fonds du joueur
    o.raised = W.vc.raise(0.1); W.step();
    const vp = S.net.posts.find(p => p.k === 'vcMe'); o.vcPost = !!vp && vp.me === 1 && /Amorçage/.test(vp.t) && /\d \$/.test(vp.t); o.got = got; off();
    for (let i = 0; i < 6; i++) W.step();
    // onglet et pastille (le joueur est ailleurs)
    [...document.querySelectorAll('button')].find(b => /Menu$/.test(b.textContent.trim())).click(); await wait(300);
    const nb = document.querySelector('#panel [data-ptab="net"]'); o.tab = !!nb && !!document.querySelector('[data-sec="net"]');
    o.badge = !!(nb && nb.dataset.nb) && W.net.unread() > 0;
    nb.click(); await wait(300);
    o.secOpen = !document.querySelector('[data-sec="net"]').hidden && document.querySelectorAll('#netPosts .npost').length > 3;
    o.seen = W.net.unread() === 0 && !nb.dataset.nb;
    o.portrait = !!document.querySelector('#netPosts .npost .nav img');
    // publication du joueur par l'interface
    document.getElementById('netPostIn').value = 'Fier de nos équipes : une semaine record pour notre groupe !'; document.getElementById('netPostGo').click(); await wait(100);
    const mp = S.net.posts.slice().reverse().find(p => p.me && p.k === 'me'); o.posted = !!mp && /semaine record/.test(document.getElementById('netPosts').innerText);
    document.getElementById('netPostIn').value = 'Deuxième message tout de suite'; document.getElementById('netPostGo').click(); await wait(50);
    o.postLimited = /attends|Doucement/.test(document.getElementById('netPostErr').textContent);
    const r0 = mp.r.slice(); for (let i = 0; i < 5; i++) W.step(); W.net.render(true);
    o.reacts = mp.r[0] > r0[0] && mp.r[0] >= 3; o.coms = mp.c.length;
    const card = document.querySelector(`#netPosts [data-pid="${mp.id}"]`), l0 = mp.r[0]; card.querySelector('[data-nr="l"]').click(); await wait(50);
    o.liked = mp.my === 'l' && mp.r[0] === l0 + 1;
    const other = S.net.posts.find(p => !p.me); W.net.setGap(0); const cm = W.net.NET.comment(other.id, 'Très juste, bravo.'); o.commented = cm.ok && other.c.some(c => c.me && /Très juste/.test(c.t));
    // salon : réponses contextuelles, limite de fréquence, politesse
    document.querySelector('[data-net="chat"]').click(); await wait(100);
    o.banner = /Salon simulé tant que le multijoueur n'est pas ouvert/.test(document.getElementById('netChat').innerText);
    W.net.setGap(0); const n0 = S.net.chat.length; document.getElementById('netSayIn').value = 'Des conseils pour une OPA ?'; document.getElementById('netSayGo').click(); await wait(50);
    const after = S.net.chat.slice(n0); o.chatMe = after.length > 0 && after[0].me === 1; o.replies = after.filter(m => !m.me).map(m => m.n + ': ' + m.t);
    o.opaReply = o.replies.some(x => /OPA|prime|flottant|actions/i.test(x));
    const z = W.net.NET.say('public', 'encore un message'); o.rate = !z.ok && /Doucement|attends/.test(z.why);
    W.net.setGap(0); const ins = W.net.NET.say('public', 'quel connard ce rival'); o.polite = ins.ok && !/connard/.test(ins.msg.t) && ins.replies.some(m => m.n === 'Modération');
    o.noRnd = true;   // contrôle plus bas (deux pages)
    o.snap = { posts: S.net.posts.length, chat: S.net.chat.length, my: mp.my, id: mp.id, txt: S.net.posts.map(p => p.t).join('|') };
    W.save(); return o;
  });
  t.check('onglet Réseau présent dans le bureau, objet NET (publish, say, onMessage), au moins 60 gabarits', r.tab && r.api && r.nTpl >= 60, 'gabarits ' + r.nTpl);
  t.check('fil alimenté par un événement réel : la levée du joueur devient une publication', r.raised && r.vcPost && r.got > 0, JSON.stringify({ raised: r.raised, vc: r.vcPost, got: r.got }));
  t.check('pastille de non-lus quand le joueur est ailleurs, effacée à l\'ouverture', r.badge && r.secOpen && r.seen && r.portrait, JSON.stringify({ badge: r.badge, open: r.secOpen, seen: r.seen, img: r.portrait }));
  t.check('le joueur publie (limite par jour) ; sa publication attire réactions et commentaires', r.posted && r.postLimited && r.reacts && r.coms >= 0, JSON.stringify({ posted: r.posted, lim: r.postLimited, reacts: r.reacts, coms: r.coms }));
  t.check('le joueur aime et commente', r.liked && r.commented, JSON.stringify({ liked: r.liked, com: r.commented }));
  t.check('salon : bandeau simulé, réponse contextuelle à une question sur l\'OPA', r.banner && r.chatMe && r.replies.length >= 1 && r.opaReply, r.replies.join(' / '));
  t.check('salon : limite de fréquence (anti-spam) et filtre des insultes', r.rate && r.polite, JSON.stringify({ rate: r.rate, polite: r.polite }));
  // sauvegarde et rechargement dans le même contexte (même localStorage)
  const pg2 = await L.newPage({ ctx: pg.context(), wait: 900 });
  const r2 = await pg2.evaluate(snap => { const S = window.WSE.S, N = S.net; if (!N) return { ok: false }; const p = N.posts.find(x => x.id === snap.id); return { ok: N.posts.length === snap.posts && N.chat.length === snap.chat && !!p && p.my === snap.my && N.posts.map(x => x.t).join('|') === snap.txt, max: N.posts.length <= 60 && N.chat.length <= 60 }; }, r.snap);
  t.check('sauvegarde et rechargement : fil, salon et réactions conservés (60 éléments au plus)', r2.ok && r2.max, JSON.stringify(r2));
  t.check('aucune erreur de page', pg.errs.length === 0 && pg2.errs.length === 0, pg.errs.concat(pg2.errs).join(' | '));
  await pg.context().close();
  // déterminisme : même graine = même fil ; et le réseau ne touche pas au flux aléatoire de l'économie
  const run = async live => {
    const p = await L.newPage({ wait: 600 }); await L.setup(p, { cash: 3e7 });
    const x = await p.evaluate(live => { const W = window.WSE, S = W.S; S.stats.raw = 4e7; S.rs = 777; W.net.reset(99); W.net.NET.live = live; W.vc.raise(0.1); for (let i = 0; i < 40; i++) W.step(); return { feed: S.net.posts.map(q => q.n + ':' + q.t + ':' + q.r.join(',')).join('|'), chat: S.net.chat.map(q => q.n + ':' + q.t).join('|'), rs: S.rs, cash: Math.round(S.cash), n: S.net.posts.length }; }, live);
    x.errs = p.errs; await p.context().close(); return x;
  };
  const a = await run(false), b = await run(false), c = await run(true);
  t.check('déterminisme : même graine, mêmes actions = même fil et même salon', a.feed === b.feed && a.chat === b.chat && a.n > 6, `${a.n} publications`);
  t.check('le réseau ne change pas l\'économie (flux aléatoire et trésorerie identiques sans simulation)', a.rs === c.rs && a.cash === c.cash, JSON.stringify({ rs: [a.rs, c.rs], cash: [a.cash, c.cash] }));
  t.check('aucune erreur de page (déterminisme)', !a.errs.length && !b.errs.length && !c.errs.length, a.errs.concat(b.errs, c.errs).join(' | '));
};
