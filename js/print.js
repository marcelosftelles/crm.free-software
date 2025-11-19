
// Impressao de OS - exposto em window.PrintAPI
(function(){
  const { parseBRL, brl, formatDateBR } = window.Utils;

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

    const valueText = brl(parseBRL(info.value));
    document.querySelector('#print-os-id').textContent = info.id + (info.status? ' - '+info.status : '');
    const html = `
      <table style="width:100%; border-collapse:collapse">
        <tr><td style="padding:6px 0"><strong>Cliente:</strong> ${info.customer}</td><td style="padding:6px 0"><strong>Contato:</strong> ${info.contact}</td></tr>
        <tr><td style="padding:6px 0"><strong>Entrada:</strong> ${formatDateBR(info.entryDate)}</td><td style="padding:6px 0"><strong>Saída:</strong> ${formatDateBR(info.exitDate)}</td></tr>
        <tr><td style="padding:6px 0"><strong>Produto/Máquina:</strong> ${info.product}</td><td style="padding:6px 0"><strong>Dias em Serviço:</strong> ${info.days || '-'}</td></tr>
      </table>
      <div style="margin-top:10px"><strong>Defeito Relatado</strong><div style="border:1px solid #ccc; padding:8px; min-height:48px">${info.defect||'-'}</div></div>
      <div style="margin-top:10px"><strong>Serviço Realizado</strong><div style="border:1px solid #ccc; padding:8px; min-height:48px">${info.service||'-'}</div></div>
      <div style="margin-top:10px"><strong>Valor do Reparo:</strong> ${valueText}</div>
    `;
    document.querySelector('#printContent').innerHTML = html;
    return { ok: true, id };
  }

  function prepareLogo(){
    const img = document.querySelector('.print-logo');
    if(img){
      // Usa sempre a logo oficial de impressão
      img.src = 'assets/print-logo.png';
      img.style.width = '320px';
      img.style.maxWidth = '320px';
      img.style.height = 'auto';
    }
  }

  function togglePrintArea(show){
    const printArea = document.querySelector('#printArea');
    if(!printArea) return;
    if(show) printArea.classList.remove('hide-print-area');
    else printArea.classList.add('hide-print-area');
  }

  async function prepareAndShow(){
    const result = buildPrintable();
    if(!result || !result.ok) return result;
    prepareLogo();
    togglePrintArea(true);
    // Dá tempo para a área de impressão aplicar o layout antes de gerar/abrir diálogo
    await new Promise(r=>setTimeout(r, 80));
    return result;
  }

  function cleanup(){ togglePrintArea(false); }

  async function printOS(){
    const result = await prepareAndShow();
    if(!result || !result.ok) return;
    try{
      if(window.ElectronAPI && window.ElectronAPI.printOS){
        await window.ElectronAPI.printOS();
      }else{
        window.print();
      }
    }finally{
      setTimeout(cleanup, 300);
    }
  }

  async function savePDF(){
    const result = await prepareAndShow();
    if(!result || !result.ok) return;
    try{
      if(window.ElectronAPI && window.ElectronAPI.savePDF){
        const res = await window.ElectronAPI.savePDF({ fileName: result.id });
        if(res?.error) alert('Erro ao salvar PDF: ' + res.error);
        else if(!res?.canceled) alert('PDF salvo em: ' + res.filePath);
      }else{
        window.print();
      }
    }finally{
      setTimeout(cleanup, 300);
    }
  }

  function choosePrintFlow(){
    const first = confirm('Imprimir agora?\nOK = Imprimir\nCancelar = Outras opções');
    if(first) return printOS();
    const second = confirm('Salvar PDF?\nOK = Salvar PDF\nCancelar = Cancelar');
    if(second) return savePDF();
    return; // cancelado
  }

  window.PrintAPI = { printOS, savePDF, choosePrintFlow, buildPrintable };
})();
