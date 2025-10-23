// relatorios.js (dados vindos de package.json)
import pkg from '../../package.json';

function formatMonthLabel(ym) {
  const [y, m] = ym.split('-').map(Number);
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${monthNames[m - 1]}/${y}`;
}

function getSeriesByKey(seriesArr, key) {
  return seriesArr.find((s) => s.chave === key) || { pontos: [] };
}

function loadReport() {
  const rel = pkg.relatorio;
  if (!rel) {
    alert('Bloco "relatorio" não encontrado em package.json');
    return;
  }

  // Título e período
  const tituloEl = document.getElementById('relatorioTitulo');
  const periodoEl = document.getElementById('relatorioPeriodo');
  tituloEl.textContent = rel.titulo || 'Relatório';
  periodoEl.textContent = `Período: ${rel.periodo.de} a ${rel.periodo.ate} — Granularidade: ${rel.periodo.granularidade}`;

  // Totais consolidados
  const contatosTotalAtualEl = document.getElementById('contatosTotalAtual');
  const contatosVariacaoEl = document.getElementById('contatosVariacao');
  const tiposTotalAtualEl = document.getElementById('tiposTotalAtual');
  const tiposVariacaoEl = document.getElementById('tiposVariacao');

  const contatos = rel.totais?.contatos || {};
  const tipos = rel.totais?.tipos || {};

  contatosTotalAtualEl.textContent = `${contatos.total ?? '-'}`;
  const varPerc = contatos.delta_vs_periodo_anterior?.percentual;
  contatosVariacaoEl.textContent = varPerc !== undefined && varPerc !== null ? `${Number(varPerc).toFixed(1)}%` : '—';

  tiposTotalAtualEl.textContent = `${tipos.total ?? '-'} (Ativos: ${tipos.ativos ?? '-'}, Inativos: ${tipos.inativos ?? '-'})`;
  tiposVariacaoEl.textContent = '—';

  // Série temporal
  const series = rel.series_temporais?.series || [];
  const totalSeries = getSeriesByKey(series, 'total');
  const ativosSeries = getSeriesByKey(series, 'ativos');
  const inativosSeries = getSeriesByKey(series, 'inativos');

  const labels = totalSeries.pontos.map((p) => formatMonthLabel(p.mes));
  const totals = totalSeries.pontos.map((p) => p.valor);
  const actives = ativosSeries.pontos.map((p) => p.valor);
  const inactives = inativosSeries.pontos.map((p) => p.valor);
  const news = totalSeries.pontos.map((p) => p.novos ?? 0);
  const deltas = totalSeries.pontos.map((p, i) => (i === 0 ? 0 : p.delta ?? 0));

  // Line chart
  const ctxLine = document.getElementById('contactsLineChart');
  new Chart(ctxLine, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Total', data: totals, borderColor: '#0d6efd', backgroundColor: 'rgba(13,110,253,0.2)', tension: 0.2 },
        { label: 'Ativos', data: actives, borderColor: '#198754', backgroundColor: 'rgba(25,135,84,0.2)', tension: 0.2 },
        { label: 'Inativos', data: inactives, borderColor: '#dc3545', backgroundColor: 'rgba(220,53,69,0.2)', tension: 0.2 },
        { label: 'Novos cadastros', data: news, borderColor: '#fd7e14', backgroundColor: 'rgba(253,126,20,0.2)', tension: 0.2 },
        { label: 'Delta mensal', data: deltas, borderColor: '#6f42c1', backgroundColor: 'rgba(111,66,193,0.2)', tension: 0.2 },
      ],
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'bottom' }, tooltip: { enabled: true } },
      scales: { y: { beginAtZero: true } },
    },
  });

  // Donut status contatos
  const cs = rel.quebras?.contatos_por_status || [];
  const ativosQtd = cs.find((x) => x.status === 'ativo')?.quantidade ?? 0;
  const inativosQtd = cs.find((x) => x.status === 'inativo')?.quantidade ?? 0;
  const ctxDonutContacts = document.getElementById('contactsStatusDonut');
  new Chart(ctxDonutContacts, {
    type: 'doughnut',
    data: {
      labels: ['Ativos', 'Inativos'],
      datasets: [
        { label: 'Contatos', data: [ativosQtd, inativosQtd], backgroundColor: ['#198754', '#dc3545'], hoverOffset: 4 },
      ],
    },
    options: { plugins: { legend: { position: 'bottom' } } },
  });

  // Barras empilhadas tipos x status
  const cpt = rel.quebras?.contatos_por_tipo || [];
  const typeLabels = cpt.map((t) => t.titulo_tipo);
  const typeActives = cpt.map((t) => t.ativos);
  const typeInactives = cpt.map((t) => t.inativos);
  const ctxStacked = document.getElementById('typesStackedChart');
  new Chart(ctxStacked, {
    type: 'bar',
    data: {
      labels: typeLabels,
      datasets: [
        { label: 'Ativos', data: typeActives, backgroundColor: '#0d6efd', stack: 'Stack 0' },
        { label: 'Inativos', data: typeInactives, backgroundColor: '#dc3545', stack: 'Stack 0' },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } },
      scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } },
    },
  });

  // Donut situação dos tipos
  const tps = rel.quebras?.tipos_por_status || [];
  const tiposAtivos = tps.find((x) => x.status === 'ativo')?.quantidade ?? 0;
  const tiposInativos = tps.find((x) => x.status === 'inativo')?.quantidade ?? 0;
  const ctxTypesStatusDonut = document.getElementById('typesStatusDonut');
  new Chart(ctxTypesStatusDonut, {
    type: 'doughnut',
    data: {
      labels: ['Ativos', 'Inativos'],
      datasets: [
        { label: 'Tipos', data: [tiposAtivos, tiposInativos], backgroundColor: ['#0d6efd', '#6c757d'] },
      ],
    },
    options: { plugins: { legend: { position: 'bottom' } } },
  });

  // Barras horizontais ranking crescimento por tipo
  const growth = rel.top?.tipos_por_crescimento || [];
  const sortedGrowth = [...growth].sort((a, b) => b.crescimento_no_periodo - a.crescimento_no_periodo);
  const growthLabels = sortedGrowth.map((g) => g.titulo_tipo);
  const growthData = sortedGrowth.map((g) => g.crescimento_no_periodo);
  const ctxGrowth = document.getElementById('typeGrowthChart');
  new Chart(ctxGrowth, {
    type: 'bar',
    data: { labels: growthLabels, datasets: [{ label: 'Crescimento %', data: growthData, backgroundColor: '#20c997' }] },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true, ticks: { callback: (v) => `${v}%` } } },
    },
  });
}

function setupLogout() {
  const btn = document.getElementById('logoutBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/index.html';
  });
}

window.addEventListener('DOMContentLoaded', () => {
  setupLogout();
  loadReport();
});