// Impressão de OS - exposto em window.PrintAPI
(function(){
  function formatDateBR(iso){
    if(!iso) return '';
    const d = new Date(iso);
    if(isNaN(d)) return iso;
    return String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0') + '/' + d.getFullYear();
  }
  function buildPrintable(){
    const id = (document.querySelector('#osNumber').value||'').trim();
    if(!id){ alert('Salve a OS antes de imprimir.'); return false; }
    const pick = sel => document.querySelector(sel).value || '';
    const info = {
      id,
      entryDate: pick('#entryDate'),
      exitDate: pick('#exitDate'),
      customer: pick('#customer'),
      contact: pick('#contact'),
      product: pick('#product'),
      defect: pick('#defect'),
      service: pick('#service'),
      value: pick('#value'),
      status: pick('#status'),
      days: pick('#days')
    };
    document.querySelector('#print-os-id').textContent = info.id + (info.status? ' — '+info.status : '');
    const html = `
      <table style="width:100%; border-collapse:collapse">
        <tr><td style="padding:6px 0"><strong>Cliente:</strong> ${info.customer}</td><td style="padding:6px 0"><strong>Contato:</strong> ${info.contact}</td></tr>
        <tr><td style="padding:6px 0"><strong>Entrada:</strong> ${formatDateBR(info.entryDate)}</td><td style="padding:6px 0"><strong>Saída:</strong> ${formatDateBR(info.exitDate)}</td></tr>
        <tr><td style="padding:6px 0"><strong>Produto/Máquina:</strong> ${info.product}</td><td style="padding:6px 0"><strong>Dias em Serviço:</strong> ${info.days}</td></tr>
      </table>
      <div style="margin-top:10px"><strong>Defeito Relatado</strong><div style="border:1px solid #ccc; padding:8px; min-height:48px">${info.defect||'-'}</div></div>
      <div style="margin-top:10px"><strong>Serviço Realizado</strong><div style="border:1px solid #ccc; padding:8px; min-height:48px">${info.service||'-'}</div></div>
      <div style="margin-top:10px"><strong>Valor do Reparo:</strong> R$ ${info.value||'0,00'}</div>
    `;
    document.querySelector('#printContent').innerHTML = html;
    return true;
  }

  function printOS(){
    if(!buildPrintable()) return;
    // usar logo2 e forçar tamanho antes de imprimir
    const img = document.querySelector('.print-logo');
    if(img){
      img.src = 'assets/logo2.png';
      // não setar largura via JS — o CSS de impressão controla o tamanho
      img.style.width = '';
      img.style.maxWidth = '';
    }
    document.querySelector('#printArea').classList.remove('hide-print-area');
    setTimeout(()=>{ window.print(); }, 80);
    setTimeout(()=>{ document.querySelector('#printArea').classList.add('hide-print-area'); }, 600);
  }

  window.PrintAPI = { printOS, buildPrintable };
})();
