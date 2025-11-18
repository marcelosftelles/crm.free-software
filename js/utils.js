
// Utils (helpers) - expostos em window.Utils
(function(){
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));
  const brl = n => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(n||0));

  function parseBRL(str){
    if(!str) return 0;
    str = (''+str).replace(/[^\d,.-]/g,'').replace(/\.(?=\d{3}(\D|$))/g,'');
    if(str.includes(',')) str = str.replace(',', '.');
    const val = parseFloat(str);
    return isNaN(val)?0:val;
  }

  function diffDays(a,b){
    const start = a? new Date(a): null;
    const end = (b? new Date(b): new Date());
    if(!start || isNaN(start)) return '';
    const ms = end - start;
    const d = Math.max(0, Math.ceil(ms / (1000*60*60*24)));
    return d;
  }

  function uid(){
    const list = window.StorageAPI.load();
    const existing = new Set(list.map(x=>x.id));
    let id;
    do{ id = 'OS' + Math.floor(10000 + Math.random()*90000); } while(existing.has(id));
    return id;
  }

  function renderStatus(s){
    const cls = s === 'Concluído' ? 'ok' : s === 'Cancelado' ? 'bad' : s === 'Aguardando peças' ? 'warn' : '';
    return `<span class="pill ${cls}">${s||''}</span>`;
  }

  function formatDateBR(iso){
  if(!iso) return '';
  const [y,m,d] = iso.split('-');
  if(!y||!m||!d) return iso;
  return `${d}/${m}/${y}`;
}
window.Utils = { $, $$, brl, parseBRL, diffDays, uid, renderStatus, formatDateBR };
})();
