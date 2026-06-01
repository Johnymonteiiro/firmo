/* global React, ReactDOM */
const { useState, useMemo, useRef, useEffect } = React;

/* ----------------------------------------------------------------
   Ícones (line icons, traço fino — combina com tipografia thin)
---------------------------------------------------------------- */
const I = {
  grid:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  doc:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>,
  receipt: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3v18l2-1.4L9 21l2-1.4L13 21l2-1.4L17 21l2-1.4V3l-2 1.4L15 3l-2 1.4L11 3 9 4.4 7 3z"/><path d="M9 8h6M9 12h6"/></svg>,
  pie:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15.5A9 9 0 1 1 8.5 3"/><path d="M21 12A9 9 0 0 0 12 3v9z"/></svg>,
  list:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>,
  wallet:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2"/><path d="M3 7v10a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-3"/><path d="M21 11h-5a2 2 0 0 0 0 4h5z"/></svg>,
  layers:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/></svg>,
  sidebar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/></svg>,
  chev:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>,
  search:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>,
  filter:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16l-6 8v6l-4 2v-8z"/></svg>,
  plus:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>,
  sun:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>,
  moon:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>,
  sortx:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m8 9 4-4 4 4M8 15l4 4 4-4"/></svg>,
  up:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 14 6-6 6 6"/></svg>,
  down:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 10 6 6 6-6"/></svg>,
  check:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-11"/></svg>,
  cmd:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6V5a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v1m0 12v1a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3v-1m0-9v6m6-6v6m-6 0h6m-6-6h6"/></svg>,
};

/* ----------------------------------------------------------------
   Dados de exemplo
---------------------------------------------------------------- */
const CONTRACTS = [
  { id: "2333/2026", empresa: "FlexSystem Tecnologia", objeto: "Suporte e manutenção de sistemas",      gestor: "Jhony Almeida",      status: "Vigente",  mensal: 60000000, global: 720000000, inicio: "01/01/2026", fim: "31/12/2026", venc: 214 },
  { id: "78/2027",   empresa: "Teste da Minha Empresa", objeto: "Linha de frente — atendimento",         gestor: "Bento Gaspar",       status: "Expirado", mensal: 4880000,  global: 58560000,  inicio: "15/03/2024", fim: "14/03/2025", venc: -78 },
  { id: "1204/2025", empresa: "Aurora Engenharia",      objeto: "Manutenção predial e infraestrutura",    gestor: "Marina Costa",       status: "Vigente",  mensal: 1250000,  global: 15000000,  inicio: "01/06/2025", fim: "31/05/2027", venc: 364 },
  { id: "905/2025",  empresa: "Nimbus Cloud Brasil",    objeto: "Hospedagem e nuvem corporativa",          gestor: "Rafael Lima",        status: "A vencer", mensal: 320000,   global: 7680000,   inicio: "01/02/2025", fim: "31/07/2026", venc: 60 },
  { id: "412/2026",  empresa: "Vértice Consultoria",    objeto: "Consultoria em gestão de processos",      gestor: "Camila Souza",       status: "Vigente",  mensal: 89000,    global: 2136000,   inicio: "10/04/2026", fim: "09/04/2028", venc: 678 },
  { id: "56/2024",   empresa: "Prado Logística",        objeto: "Transporte e armazenagem",                gestor: "Eduardo Reis",       status: "Expirado", mensal: 215000,   global: 5160000,   inicio: "01/01/2024", fim: "31/12/2024", venc: -152 },
  { id: "1801/2026", empresa: "BioClean Serviços",      objeto: "Limpeza e conservação dos campi",         gestor: "Patrícia Nunes",     status: "Vigente",  mensal: 740000,   global: 17760000,  inicio: "01/05/2026", fim: "30/04/2028", venc: 698 },
  { id: "302/2025",  empresa: "Sigma Segurança",        objeto: "Vigilância patrimonial 24h",              gestor: "Otávio Mendes",      status: "A vencer", mensal: 530000,   global: 12720000,  inicio: "01/03/2025", fim: "31/08/2026", venc: 91 },
  { id: "990/2026",  empresa: "DataPrint Gráfica",      objeto: "Serviços gráficos e reprografia",         gestor: "Larissa Dias",       status: "Vigente",  mensal: 47000,    global: 1128000,   inicio: "01/07/2026", fim: "30/06/2027", venc: 395 },
];

const fmt = (n) => "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const STATUS_CLS = { "Vigente": "ok", "A vencer": "warn", "Expirado": "bad" };

/* ----------------------------------------------------------------
   Primary sidebar
---------------------------------------------------------------- */
function PrimaryNav({ collapsed, route, setRoute }) {
  const [open, setOpen] = useState("Contratos");
  const item = (id, icon, label, sub) => {
    const isActive = route.section === id && !sub;
    return (
      <div key={id}
        className={"nav-item" + (isActive ? " active" : "")}
        onClick={() => { if (sub) { setOpen(open === id ? "" : id); } else { setRoute({ section: id, leaf: "" }); } }}>
        <span className="ico">{icon}</span>
        <span className="label">{label}</span>
        {sub && <span className={"chev" + (open === id ? " open" : "")}>{I.chev}</span>}
      </div>
    );
  };
  return (
    <aside className={"nav" + (collapsed ? " collapsed" : "")}>
      <div className="brand">
        <div className="brand-mark">{I.cmd}</div>
        <div className="brand-text">
          <div className="brand-name">Firmo</div>
          <div className="brand-sub">UFSC</div>
        </div>
      </div>

      <div className="nav-scroll">
        <div className="nav-label">Geral</div>
        {item("dashboard", I.grid, "Dashboard")}

        <div className="nav-label">Gestão</div>
        {item("contratos", I.doc, "Contratos", true)}
        {open === "contratos" && !collapsed && (
          <div className="nav-children">
            {[["continuados", "Continuados"], ["nao", "Não Continuados"]].map(([lf, lb]) => (
              <div key={lf}
                className={"nav-sub" + (route.section === "contratos" && route.leaf === lf ? " active" : "")}
                onClick={() => setRoute({ section: "contratos", leaf: lf })}>
                <span className="dot"></span>{lb}
              </div>
            ))}
          </div>
        )}
        {item("faturamento", I.receipt, "Faturamento")}
        {item("orcamento", I.pie, "Gestão Orçamentária")}
      </div>

      <div className="nav-user">
        <div className="avatar">N</div>
        <div className="who"><b>Núcleo Gestor</b><span>gestor@ufsc.br</span></div>
        <span className="updown">{I.sortx}</span>
      </div>
    </aside>
  );
}

/* ----------------------------------------------------------------
   Secondary (contextual) sidebar — a árvore de Empenhos
---------------------------------------------------------------- */
function ContextNav({ active, setActive }) {
  const [open, setOpen] = useState({ relacao: true, empenhos: true, empA: true, empR: false });
  const tog = (k) => setOpen((o) => ({ ...o, [k]: !o[k] }));
  const leaf = (id, label, deep) => (
    <div className={"tree-leaf" + (deep ? " deep" : "") + (active === id ? " active" : "")}
      onClick={() => setActive(id)}>{label}</div>
  );
  return (
    <nav className="sub-nav">
      <div className="tree-group">
        <div className="tree-head" onClick={() => tog("relacao")}>
          <span className="ico">{I.list}</span> Relação de Contratos
          <span className={"chev" + (open.relacao ? " open" : "")}>{I.chev}</span>
        </div>
        {open.relacao && <>
          {leaf("rel-todos", "Todos")}
          {leaf("rel-arq", "Arquivados")}
          {leaf("rel-hist", "Histórico")}
        </>}
      </div>

      <div className="tree-group">
        <div className="tree-head" onClick={() => tog("empenhos")}>
          <span className="ico">{I.wallet}</span> Empenhos e Saldos
          <span className={"chev" + (open.empenhos ? " open" : "")}>{I.chev}</span>
        </div>
        {open.empenhos && <>
          <div className="tree-subhead">Empenhos</div>
          {leaf("emp-todos", "Todos", true)}
          {leaf("emp-arq", "Arquivados", true)}
          {leaf("emp-hist", "Histórico", true)}
          <div className="tree-subhead">Reforços</div>
          {leaf("ref-todos", "Todos", true)}
          {leaf("ref-arq", "Arquivados", true)}
          {leaf("ref-hist", "Histórico", true)}
        </>}
      </div>
    </nav>
  );
}

/* ----------------------------------------------------------------
   Status filter dropdown
---------------------------------------------------------------- */
function StatusFilter({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  const opts = ["Todos", "Vigente", "A vencer", "Expirado"];
  return (
    <div className="dropdown" ref={ref}>
      <button className="btn btn-ghost" onClick={() => setOpen(!open)}>
        <span className="ico">{I.filter}</span>
        {value === "Todos" ? "Status" : value}
        <span style={{ width: 13, opacity: .6 }}>{I.chev}</span>
      </button>
      {open && (
        <div className="menu">
          {opts.map((o) => (
            <div key={o} className={"menu-item" + (value === o ? " on" : "")}
              onClick={() => { onChange(o); setOpen(false); }}>
              {o}<span className="check">{I.check}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------
   Tabela
---------------------------------------------------------------- */
const COLS = [
  { k: "id", label: "Contrato" },
  { k: "empresa", label: "Empresa" },
  { k: "objeto", label: "Objeto" },
  { k: "gestor", label: "Gestor" },
  { k: "status", label: "Status" },
  { k: "mensal", label: "Valor Mensal", num: true },
  { k: "global", label: "Valor Global", num: true },
  { k: "fim", label: "Vigência" },
];

function ContractTable({ rows, sort, setSort }) {
  const onSort = (k) => setSort((s) => s.k === k ? { k, dir: s.dir === "asc" ? "desc" : "asc" } : { k, dir: "asc" });
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{COLS.map((c) => (
            <th key={c.k} className={(c.num ? "num " : "") + (sort.k === c.k ? "sorted" : "")}>
              <span className="sort" onClick={() => onSort(c.k)}>
                {c.label}
                <span className="ico">{sort.k === c.k ? (sort.dir === "asc" ? I.up : I.down) : I.sortx}</span>
              </span>
            </th>
          ))}</tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={COLS.length}><div className="empty">Nenhum contrato encontrado.</div></td></tr>
          ) : rows.map((r) => (
            <tr key={r.id}>
              <td><span className="strong mono">{r.id}</span></td>
              <td><span className="obj cell-clip" title={r.empresa}>{r.empresa}</span></td>
              <td><span className="cell-clip" title={r.objeto}>{r.objeto}</span></td>
              <td>{r.gestor}</td>
              <td><span className={"badge " + STATUS_CLS[r.status]}>{r.status}</span></td>
              <td className="num mono">{fmt(r.mensal)}</td>
              <td className="num mono">{fmt(r.global)}</td>
              <td className="mono">{r.fim}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ----------------------------------------------------------------
   Dashboard view (stat cards)
---------------------------------------------------------------- */
function DashboardView() {
  const stats = [
    { k: "Contratos vigentes", v: "37", d: "+4 no mês", up: true },
    { k: "Valor global ativo", v: "R$ 812,1 mi", d: "+2,3%", up: true },
    { k: "A vencer em 60 dias", v: "6", d: "atenção", up: false },
    { k: "Empenhos abertos", v: "128", d: "−9", up: false },
  ];
  return (
    <div className="stats">
      {stats.map((s) => (
        <div key={s.k} className="stat">
          <div className="k">{s.k}</div>
          <div className="v mono">{s.v}</div>
          <div className={"d " + (s.up ? "up" : "down")}>
            <span style={{ width: 13 }}>{s.up ? I.up : I.down}</span>{s.d}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------
   App
---------------------------------------------------------------- */
const ACCENTS = {
  "Azul institucional": { h: 256, c: 0.085, l: 0.56 },
  "Azul UFSC":          { h: 245, c: 0.12,  l: 0.5 },
  "Teal":               { h: 195, c: 0.08,  l: 0.6 },
  "Verde (original)":   { h: 158, c: 0.1,   l: 0.6 },
};
const DENS = {
  compacto:    { row: "38px", font: "12.5px" },
  moderado:    { row: "46px", font: "13.5px" },
  espacoso:    { row: "54px", font: "14px" },
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "accent": "Azul institucional",
  "density": "moderado",
  "textContrast": 88
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [collapsed, setCollapsed] = useState(false);
  const [route, setRoute] = useState({ section: "contratos", leaf: "continuados" });
  const [treeActive, setTreeActive] = useState("rel-todos");
  const [query, setQuery] = useState("");
  const [statusF, setStatusF] = useState("Todos");
  const [sort, setSort] = useState({ k: "id", dir: "asc" });
  const [page, setPage] = useState(0);
  const [rpp, setRpp] = useState(10);

  /* apply theme + tokens (disable transitions during the swap to avoid Chrome
     freezing background-color values that derive from theme variables) */
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("no-trans");
    root.dataset.theme = t.theme;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("no-trans")));
    return () => cancelAnimationFrame(id);
  }, [t.theme]);
  useEffect(() => {
    const a = ACCENTS[t.accent] || ACCENTS["Azul institucional"];
    const r = document.documentElement.style;
    r.setProperty("--accent-h", a.h); r.setProperty("--accent-c", a.c); r.setProperty("--accent-l", a.l);
    const d = DENS[t.density] || DENS.moderado;
    r.setProperty("--row-h", d.row); r.setProperty("--font", d.font);
    const l = t.theme === "light" ? (0.42 - (t.textContrast - 88) * 0.004) : (0.7 + (t.textContrast - 70) * 0.006);
    r.setProperty("--text", `oklch(${Math.max(0.25, Math.min(0.96, l))} 0.006 256)`);
  }, [t.accent, t.density, t.textContrast, t.theme]);

  const showContext = route.section === "contratos";

  const filtered = useMemo(() => {
    let r = CONTRACTS.filter((c) =>
      (statusF === "Todos" || c.status === statusF) &&
      (query === "" || (c.empresa + c.objeto + c.id + c.gestor).toLowerCase().includes(query.toLowerCase()))
    );
    r = [...r].sort((a, b) => {
      let x = a[sort.k], y = b[sort.k];
      if (typeof x === "string") { x = x.toLowerCase(); y = y.toLowerCase(); }
      return (x < y ? -1 : x > y ? 1 : 0) * (sort.dir === "asc" ? 1 : -1);
    });
    return r;
  }, [query, statusF, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / rpp));
  const pageRows = filtered.slice(page * rpp, page * rpp + rpp);
  useEffect(() => { setPage(0); }, [query, statusF, rpp]);

  const titles = {
    dashboard: "Painel geral",
    contratos: route.leaf === "nao" ? "Contratos Não Continuados" : "Contratos Continuados",
    faturamento: "Faturamento",
    orcamento: "Gestão Orçamentária",
  };

  return (
    <div className="app">
      <PrimaryNav collapsed={collapsed} route={route} setRoute={setRoute} />

      <div className="main">
        <header className="topbar">
          <button className="icon-btn" onClick={() => setCollapsed(!collapsed)} title="Recolher menu">{I.sidebar}</button>
          <span className="page-title">{titles[route.section]}</span>
          <div className="spacer"></div>
          <button className="icon-btn" onClick={() => setTweak("theme", t.theme === "dark" ? "light" : "dark")} title="Tema">
            {t.theme === "dark" ? I.sun : I.moon}
          </button>
        </header>

        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          {showContext && <ContextNav active={treeActive} setActive={setTreeActive} />}

          <div className="content">
            {route.section === "dashboard" && <DashboardView />}

            {route.section === "contratos" && <>
              <div className="toolbar">
                <div className="search">
                  <span className="ico">{I.search}</span>
                  <input placeholder="Buscar contratos..." value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
                <StatusFilter value={statusF} onChange={setStatusF} />
                <div className="spacer"></div>
                <button className="btn btn-primary"><span className="ico">{I.plus}</span> Novo Contrato</button>
              </div>

              <div className="card">
                <ContractTable rows={pageRows} sort={sort} setSort={setSort} />
                <div className="tfoot">
                  <div className="rpp">
                    Linhas por página
                    <select className="select-mini" value={rpp} onChange={(e) => setRpp(+e.target.value)}>
                      {[10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="pager">
                    <span style={{ marginRight: 6 }}>
                      {filtered.length === 0 ? "0" : (page * rpp + 1) + "–" + Math.min((page + 1) * rpp, filtered.length)} de {filtered.length}
                    </span>
                    <button className="pg-btn" disabled={page === 0} onClick={() => setPage(page - 1)}><span style={{ width: 16, transform: "rotate(90deg)", display: "grid" }}>{I.chev}</span></button>
                    <button className="pg-btn" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}><span style={{ width: 16, transform: "rotate(-90deg)", display: "grid" }}>{I.chev}</span></button>
                  </div>
                </div>
              </div>
            </>}

            {(route.section === "faturamento" || route.section === "orcamento") && (
              <div className="card"><div className="empty">Módulo “{titles[route.section]}” — em construção.</div></div>
            )}
          </div>
        </div>
      </div>

      <TweaksPanel>
        <TweakSection label="Tema" />
        <TweakRadio label="Modo" value={t.theme} options={["dark", "light"]} onChange={(v) => setTweak("theme", v)} />
        <TweakSelect label="Acento" value={t.accent} options={Object.keys(ACCENTS)} onChange={(v) => setTweak("accent", v)} />
        <TweakSection label="Densidade & texto" />
        <TweakRadio label="Densidade" value={t.density} options={["compacto", "moderado", "espacoso"]} onChange={(v) => setTweak("density", v)} />
        <TweakSlider label="Contraste do texto" value={t.textContrast} min={70} max={100} unit="" onChange={(v) => setTweak("textContrast", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
