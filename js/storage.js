
// Persistência e CSV - expostos em window.StorageAPI
(function(){
  const key = 'telles_os_v1';
  const seedFlagKey = 'telles_os_seeded';

  function load(){
    try{ return JSON.parse(localStorage.getItem(key))||[] }catch{ return [] }
  }
  function saveAll(list){ localStorage.setItem(key, JSON.stringify(list)); }

  function exportCSV(){
    const list = load();
    const cols = ['id','entryDate','exitDate','customer','contact','product','defect','service','value','status','days'];
    const lines = [cols.join(';')];
    for(const x of list){ lines.push(cols.map(c=>String(x[c]??'').replaceAll('\n',' ').replaceAll(';',',')).join(';')) }
    const blob = new Blob(["\ufeff"+lines.join('\n')],{type:'text/csv;charset=utf-8'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'os_telles.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function importCSV(file){
    const reader = new FileReader();
    reader.onload = e=>{
      const txt = e.target.result; if(!txt) return;
      const rows = txt.split(/\r?\n/).filter(Boolean);
      const header = rows.shift().split(/;|,/);
      const mapIndex = name => header.findIndex(h=>h.trim().toLowerCase()===name);
      const idx = {
        id: mapIndex('id'),
        entryDate: mapIndex('entrydate'),
        exitDate: mapIndex('exitdate'),
        customer: mapIndex('customer'),
        contact: mapIndex('contact'),
        product: mapIndex('product'),
        defect: mapIndex('defect'),
        service: mapIndex('service'),
        value: mapIndex('value'),
        status: mapIndex('status'),
        days: mapIndex('days')
      };
      const list = load();
      for(const r of rows){
        const cols = r.split(/;|,/);
        const item = {
          id: cols[idx.id]||window.Utils.uid(),
          entryDate: cols[idx.entryDate]||'',
          exitDate: cols[idx.exitDate]||'',
          customer: cols[idx.customer]||'',
          contact: cols[idx.contact]||'',
          product: cols[idx.product]||'',
          defect: cols[idx.defect]||'',
          service: cols[idx.service]||'',
          value: window.Utils.parseBRL(cols[idx.value]||'0'),
          status: cols[idx.status]||'Em análise',
          days: cols[idx.days]? Number(cols[idx.days]): undefined,
          createdAt: Date.now(), updatedAt: Date.now()
        };
        const pos = list.findIndex(x=>x.id===item.id);
        if(pos>=0) list[pos]=item; else list.push(item);
      }
      saveAll(list);
      window.App.render();
      alert('Importação concluída: '+rows.length+' linha(s).');
    };
    reader.readAsText(file,'utf-8');
  }

  function seedOnce(){
    if(localStorage.getItem(seedFlagKey)==='1') return;
    // marca primeira execução para não reseedar nunca mais
    localStorage.setItem(seedFlagKey,'1');
    // se já existem registros, não semear
    if(load().length) return;
    const list = load();
    if(list.length) return;
    const samples = [
      {id:'OS2101', entryDate:'2025-08-09', exitDate:'2025-09-01', customer:'Rafael Bispo', contact:'81 9696-1568', product:'Notebook Lenovo', defect:'SO corrompido e HD com falhas', service:'Troca p/ SSD 256GB, Win11, limpeza', value:235, status:'Concluído'},
      {id:'OS2102', entryDate:'2025-08-07', exitDate:'2025-08-07', customer:'Giba TIPS', contact:'81 8323-9206', product:'Consultoria', defect:'—', service:'Levantamento + orçamento + montagem domiciliar', value:500, status:'Concluído'},
      {id:'OS2103', entryDate:'2025-08-13', exitDate:'', customer:'Filipe', contact:'81 9784-2812', product:'Notebook HP', defect:'Limpeza total + possíveis upgrades + formatação', service:'Limpeza + upgrade SSD/RAM + formatação', value:535, status:'Em análise'}
    ];
    for(const s of samples){ s.days = window.Utils.diffDays(s.entryDate,s.exitDate); s.createdAt = Date.now(); s.updatedAt = Date.now(); }
    saveAll(samples);
    localStorage.setItem(seedFlagKey,'1');
  }

  window.StorageAPI = { load, saveAll, exportCSV, importCSV, seedOnce };
})();
