export const PLANO_REAL = '1994-07';
// Presidential elections, by the month of the deciding round. Also shown as events.
// `term` is the month the term began, when it wasn't the January after.
export const ELECTIONS = [
  { date: '1989-12', term: '1990-03', label: 'Eleição de Collor', note: 'Primeira eleição direta desde 1960. O IPCA mensal chega a 82% em março de 1990, a maior taxa da série.' },
  { date: '1994-10', label: 'Eleição de FHC' },
  { date: '1998-10', label: 'Reeleição de FHC' },
  { date: '2002-10', label: 'Eleição de Lula', note: 'O medo do mercado leva o dólar a quase R$ 4. O IPCA chega a 3% em novembro e a meta Selic a 26,5% em fevereiro de 2003.' },
  { date: '2006-10', label: 'Reeleição de Lula' },
  { date: '2010-10', label: 'Eleição de Dilma' },
  { date: '2014-10', label: 'Reeleição de Dilma', note: 'Logo após a eleição, o BC volta a subir a meta Selic, de 11% até 14,25% em julho de 2015.' },
  { date: '2018-10', label: 'Eleição de Bolsonaro' },
  { date: '2022-10', label: 'Eleição de Lula' },
  { date: '2026-10', label: 'Eleição presidencial' },
];
// Who governed from each month on, and their party at the time. Drawn as bands behind the lines.
export const GOVERNMENTS = [
  { from: '1979-03', president: 'Figueiredo', party: 'PDS' },
  { from: '1985-03', president: 'Sarney', party: 'PMDB' },
  { from: '1990-03', president: 'Collor', party: 'PRN' },
  { from: '1992-10', president: 'Itamar', party: 'sem partido' },
  { from: '1995-01', president: 'FHC', party: 'PSDB' },
  { from: '2003-01', president: 'Lula', party: 'PT' },
  { from: '2011-01', president: 'Dilma', party: 'PT' },
  { from: '2016-05', president: 'Temer', party: 'PMDB' },
  { from: '2017-12', president: 'Temer', party: 'MDB' },
  { from: '2019-01', president: 'Bolsonaro', party: 'PSL' },
  { from: '2019-11', president: 'Bolsonaro', party: 'sem partido' },
  { from: '2021-11', president: 'Bolsonaro', party: 'PL' },
  { from: '2023-01', president: 'Lula', party: 'PT' },
];
// Brazilian events, and global ones that reached Brazil, that help explain moves in the IPCA
// or the Selic. By the month they happened; `note` says what they did to either.
export const EVENTS = [
  { date: '1982-08', label: 'Crise da dívida externa', note: 'A moratória do México corta o crédito externo do Brasil, que recorre ao FMI em novembro.' },
  { date: '1983-02', label: 'Maxidesvalorização do cruzeiro', note: 'O cruzeiro é desvalorizado em 30%. O IPCA anual passa de 105% em 1982 para 164% em 1983.' },
  { date: '1985-03', label: 'Fim do regime militar', note: 'José Sarney assume no lugar de Tancredo Neves, com a inflação acima de 200% ao ano.' },
  { date: '1986-02', label: 'Plano Cruzado', note: 'Congelamento de preços e troca do cruzeiro pelo cruzado. O IPCA mensal cai de 12,7% em fevereiro para 0,8% em abril, mas falta produto nas prateleiras.' },
  { date: '1986-11', label: 'Cruzado II', note: 'Logo após as eleições, o governo libera preços e aumenta impostos. O IPCA mensal volta a 11,7% em dezembro.' },
  { date: '1987-02', label: 'Moratória da dívida externa', note: 'O Brasil suspende o pagamento de juros da dívida externa aos bancos.' },
  { date: '1987-06', label: 'Plano Bresser', note: 'Novo congelamento de preços, por 90 dias. O IPCA mensal cai de 19,7% em junho para 4,9% em agosto e volta a subir.' },
  { date: '1989-01', label: 'Plano Verão', note: 'Congelamento e troca do cruzado pelo cruzado novo. O IPCA mensal cai para 6,8% em março e chega a 51,5% em dezembro.' },
  { date: '1990-03', label: 'Plano Collor', note: 'Confisco da poupança e de aplicações acima de 50 mil cruzados novos, e volta do cruzeiro. O IPCA mensal cai de 82% em março para 7,6% em maio.' },
  { date: '1991-01', label: 'Plano Collor II', note: 'Novo congelamento de preços e salários. O IPCA mensal cai de 20,8% em janeiro para 5% em abril.' },
  { date: '1992-09', label: 'Impeachment de Collor', note: 'Collor é afastado pela Câmara e renuncia em dezembro. Itamar Franco assume e, em maio de 1993, nomeia FHC ministro da Fazenda.' },
  { date: '1994-03', label: 'URV', note: 'A Unidade Real de Valor passa a indexar preços e salários, preparando a troca de moeda em julho.' },
  { date: '1994-07', label: 'Plano Real', note: 'Nova moeda. O IPCA mensal cai de 47% em junho para menos de 2% em agosto, com juros muito altos para sustentá-lo.' },
  { date: '1994-12', label: 'Crise do México', note: 'Fuga de capitais de países emergentes. Em março de 1995 o BC sobe os juros, que passam de 85% ao ano em abril.' },
  { date: '1997-10', label: 'Crise asiática', note: 'Para defender o real, o BC sobe a Selic de 20% para 46% ao ano.' },
  { date: '1998-08', label: 'Moratória russa', note: 'Nova fuga de capitais. A Selic sobe de 19% para 42% ao ano e o Brasil recorre ao FMI.' },
  { date: '1999-01', label: 'Câmbio flutuante', note: 'Sem reservas para segurar o câmbio, o real é desvalorizado. Em março a Selic vai a 45% para conter o repasse ao IPCA.' },
  { date: '1999-06', label: 'Metas de inflação', note: 'O BC passa a usar a Selic para perseguir uma meta para o IPCA. Começa a meta Selic.' },
  { date: '2001-06', label: 'Racionamento de energia', note: 'Junto com a crise argentina, pressiona o câmbio e a inflação. A meta Selic sobe de 15,25% para 19% ao longo de 2001.' },
  { date: '2005-06', label: 'Mensalão', note: 'Crise política com pouco efeito nos mercados. A meta Selic, em 19,75% desde maio, começa a cair em setembro.' },
  { date: '2008-09', label: 'Quebra do Lehman Brothers', note: 'Crise financeira global. O BC corta a meta Selic de 13,75% para 8,75% entre janeiro e julho de 2009.' },
  { date: '2011-08', label: 'Corte surpresa da Selic', note: 'Com a inflação acima da meta, o BC começa a cortar a meta Selic, de 12,5% até a mínima de 7,25% em outubro de 2012.' },
  { date: '2015-01', label: 'Reajuste de preços administrados', note: 'Energia elétrica sobe mais de 50% no ano. O IPCA de 2015 chega a 10,67%, o maior desde 2002, e a meta Selic a 14,25%.' },
  { date: '2016-05', label: 'Temer assume a Presidência', note: 'Com Dilma afastada pelo Senado, Temer assume interinamente e nomeia Henrique Meirelles na Fazenda e Ilan Goldfajn no BC.' },
  { date: '2016-08', label: 'Impeachment de Dilma', note: 'Temer é efetivado na Presidência. Com a inflação em queda, o BC começa a cortar a meta Selic em outubro, de 14,25%.' },
  { date: '2016-12', label: 'Teto de gastos', note: 'Limita o crescimento dos gastos públicos à inflação. Ajuda a ancorar expectativas, e a meta Selic cai até 6,5% em março de 2018.' },
  { date: '2017-05', label: 'Joesley Day', note: 'A gravação de Temer derruba a bolsa quase 9% e faz o dólar subir 8% em um dia. O BC sinaliza cortes menores na Selic.' },
  { date: '2018-05', label: 'Greve dos caminhoneiros', note: 'O desabastecimento leva o IPCA de junho a 1,26%, o maior para o mês desde 1995.' },
  { date: '2020-03', label: 'Pandemia de covid-19', note: 'O BC corta a meta Selic até a mínima histórica de 2%, em agosto.' },
  { date: '2021-02', label: 'Autonomia do Banco Central', note: 'Diretores do BC passam a ter mandatos fixos, desencontrados do mandato presidencial.' },
  { date: '2021-03', label: 'Selic volta a subir', note: 'Com o IPCA acima de 5% em 12 meses, começa o ciclo que leva a meta Selic de 2% a 13,75% em agosto de 2022.' },
  { date: '2022-02', label: 'Invasão da Ucrânia', note: 'Petróleo e alimentos disparam. O IPCA em 12 meses chega a 12,13% em abril, o maior desde 2003.' },
  { date: '2022-06', label: 'Teto do ICMS sobre combustíveis', note: 'O corte de impostos sobre combustíveis e energia leva a três meses de deflação no IPCA, de julho a setembro.' },
  { date: '2023-08', label: 'Arcabouço fiscal', note: 'Substitui o teto de gastos. No mesmo mês, o BC começa a cortar a meta Selic, de 13,75%.' },
  { date: '2024-12', label: 'Dólar acima de R$ 6', note: 'Dúvidas sobre as contas públicas derrubam o real. O BC sobe a meta Selic em 1 ponto e a leva a 15% em junho de 2025.' },
];
export const EVENT_SNAP = 8; // px within which the crosshair jumps to an event's month
export const STEPS = [0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100];
export const MONTH_STEPS = [1, 3, 6, 12];
export const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
export const percent = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const MIN_GAP = 48; // px between time labels
export const LABEL_WIDTH = 1280; // px; wider screens show the same time labels as this width, spaced further apart
export const MIN_SPAN = 6; // months
export const BUFFER = 20; // months of flat line padding each end of the series
export const HOLD = 300; // ms a finger must stay still before it scrubs instead of panning
export const TAP_SLOP = 8; // px a finger can drift and still count as still
export const DOUBLE_TAP = 300; // ms

// In tooltip order; drawn in reverse so IPCA stays on top.
// Every line is plotted from its `monthly` field; `tooltip` names the field the tooltip shows instead.
// `step` lines only change at discrete decisions, so they're drawn as steps instead of curves.
export const LINES = [
  { key: 'ipca', label: 'IPCA', url: '/api/ipca' },
  { key: 'selic', label: 'Selic', url: '/api/selic' },
  { key: 'selicTarget', label: 'Meta Selic', url: '/api/selic-target', tooltip: 'target', step: true, dash: [4, 4] },
];

export const PALETTES = {
  light: { ipca: '#f0541f', selic: '#6665ff', selicTarget: '#6665ff', zero: '#cbcbd2', election: '#e6e6eb', event: '#a3a2ab', band: '#efeff3', year: '#dddde3', month: '#ededf1' },
  dark: { ipca: '#ff6534', selic: '#6665ff', selicTarget: '#6665ff', zero: '#34343d', election: '#141419', event: '#5e5d66', band: '#0a0a0d', year: '#1c1c23', month: '#0f0f13' },
};
