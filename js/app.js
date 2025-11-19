
// App principal - exposto em window.App
(function(){
  const { $, $$, brl, parseBRL, diffDays, uid, renderStatus } = window.Utils;
  const { load, saveAll, exportCSV, importCSV, seedOnce } = window.StorageAPI;
  const { choosePrintFlow } = window.PrintAPI;

  let currentId = null;
  function applyLogo(src){
    const headerLogo = document.querySelector('.logo');
    const printLogo = document.querySelector('.print-logo');
    if(headerLogo) headerLogo.src = src;
    if(printLogo) printLogo.src = src;
  }
  function loadLogo(){
    const saved = localStorage.getItem('telles_logo');
    if(saved){ applyLogo(saved); }
  }
  function wireLogoUpload(){
    const input = document.getElementById('logoFile');
    if(!input) return;
    input.addEventListener('change', e=>{
      const f = e.target.files && e.target.files[0];
      if(!f) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const dataURL = ev.target.result;
        localStorage.setItem('telles_logo', dataURL);
        applyLogo(dataURL);
        alert('Logo atualizada!');
      };
      reader.readAsDataURL(f);
    });
  }


  function clearForm(){
    ['osNumber','entryDate','exitDate','customer','contact','product','defect','service','value','status','days'].forEach(id=>{
      const el = $('#'+id);
      if(el && !el.disabled) el.value = '';
    });
    $('#status').value = 'Em análise';
    $('#days').value = '';
    currentId = null;
  }

  function fillForm(item){
    $('#osNumber').value = item.id || '';
    $('#entryDate').value = item.entryDate || '';
    $('#exitDate').value = item.exitDate || '';
    $('#customer').value = item.customer || '';
    $('#contact').value = item.contact || '';
    $('#product').value = item.product || '';
    $('#defect').value = item.defect || '';
    $('#service').value = item.service || '';
    $('#value').value = item.value != null ? item.value.toString().replace('.',',') : '';
    $('#status').value = item.status || 'Em análise';
    $('#days').value = item.days ?? '';
  }

  function render(){
    const list = load();
    const tbody = $('#table tbody');
    tbody.innerHTML = '';

    const q = ($('#search').value || '').toLowerCase();
    const fs = $('#filterStart').value;
    const fe = $('#filterEnd').value;
    const st = $('#filterStatus').value;
    const sortOrder = $('#sortOrder') ? $('#sortOrder').value : 'recent';

    const filtered = list.filter(x=>{
      if(st && x.status !== st) return false;
      if(fs && x.entryDate && x.entryDate < fs) return false;
      if(fe && x.entryDate && x.entryDate > fe) return false;
      if(q){
        const hay = [x.id,x.customer,x.product,x.defect,x.service,x.status].join(' ').toLowerCase();
        if(!hay.includes(q)) return false;
      }
      return true;
    });

    $('#count').textContent = filtered.length + ' registro(s)';

    const sorted = [...filtered].sort((a,b)=>{
      const score = (it)=>{
        const entry = it.entryDate ? Date.parse(it.entryDate) : NaN;
        if(!Number.isNaN(entry)) return entry;
        if(it.updatedAt) return it.updatedAt;
        if(it.createdAt) return it.createdAt;
        return 0;
      };
      const diff = score(b) - score(a);
      return sortOrder === 'old' ? -diff : diff;
    });

    for(const item of sorted){
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="muted">${item.id||''}</td>
        <td>${item.entryDate||''}</td>
        <td>${item.exitDate||''}</td>
        <td>${item.customer||''}</td>
        <td>${item.contact||''}</td>
        <td>${item.product||''}</td>
        <td>${item.defect||''}</td>
        <td>${item.service||''}</td>
        <td>${item.value!=null? brl(item.value): ''}</td>
        <td>${renderStatus(item.status)}</td>
        <td>${item.days ?? ''}</td>
      `;
      tr.addEventListener('click',()=>{
        currentId = item.id;
        fillForm(item);
        window.scrollTo({top:0,behavior:'smooth'});
      });
      tbody.appendChild(tr);
    }
  }

  function upsert(){
    const id = ($('#osNumber').value || '').trim() || uid();
    const entryDate = $('#entryDate').value || '';
    const exitDate = $('#exitDate').value || '';
    const customer = $('#customer').value.trim();
    const contact = $('#contact').value.trim();
    const product = $('#product').value.trim();
    const defect = $('#defect').value.trim();
    const service = $('#service').value.trim();
    const value = parseBRL($('#value').value);
    const status = $('#status').value;
    const days = diffDays(entryDate, exitDate);

    if(!entryDate || !customer || !product){
      alert('Preencha ao menos: Data de Entrada, Cliente e Produto/Máquina.');
      return;
    }

    const list = load();
    const idx = list.findIndex(x=>x.id===id);
    const item = { id, entryDate, exitDate, customer, contact, product, defect, service, value, status, days, updatedAt: Date.now() };
    if(idx>=0) list[idx] = item; else list.push({...item, createdAt: Date.now()});
    saveAll(list);
    fillForm(item);
    render();
  }

  function removeItem(){
    const id = ($('#osNumber').value||'').trim();
    if(!id){ alert('Nenhuma OS selecionada.'); return }
    if(!confirm('Excluir a OS '+id+'?')) return;
    const list = load().filter(x=>x.id!==id);
    saveAll(list); clearForm(); render();
  }

  function wire(){
    $('#btnGenOS').addEventListener('click', ()=>{ $('#osNumber').value = uid(); });
    $('#entryDate').addEventListener('change',()=>{ $('#days').value = diffDays($('#entryDate').value,$('#exitDate').value); });
    $('#exitDate').addEventListener('change',()=>{ $('#days').value = diffDays($('#entryDate').value,$('#exitDate').value); });
    $('#value').addEventListener('blur',()=>{ const v=parseBRL($('#value').value); $('#value').value = v? v.toFixed(2).replace('.',',') : '' });

    $('#btnSave').addEventListener('click', upsert);
    $('#btnClear').addEventListener('click', clearForm);
    $('#btnDelete').addEventListener('click', removeItem);
    $('#btnPrint').addEventListener('click', choosePrintFlow);

    $('#search').addEventListener('input', render);
    $('#filterStart').addEventListener('change', render);
    $('#filterEnd').addEventListener('change', render);
    $('#filterStatus').addEventListener('change', render);
    const sortSelect = $('#sortOrder');
    if(sortSelect) sortSelect.addEventListener('change', render);
    $('#btnResetFilters').addEventListener('click', ()=>{
      ['filterStart','filterEnd','filterStatus','search'].forEach(id=>$('#'+id).value='');
      if(sortSelect) sortSelect.value = 'recent';
      render();
    });

    $('#btnExport').addEventListener('click', exportCSV);
    $('#importCsv').addEventListener('change', e=>{ if(e.target.files[0]) importCSV(e.target.files[0]); e.target.value=''; });
    $('#btnNew').addEventListener('click', ()=>{ clearForm(); $('#osNumber').value = uid(); });
  }

  function init(){
    loadLogo();
    seedOnce();
    render();
    wire();
    wireLogoUpload();
  }

  window.App = { init, render, clearForm };
  document.addEventListener('DOMContentLoaded', init);
})();
