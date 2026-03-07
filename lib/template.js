function esc(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function scoreColor(s) {
  if (s >= 70) return 'var(--green)';
  if (s >= 55) return 'var(--blue)';
  if (s >= 35) return 'var(--accent)';
  return 'var(--red)';
}

function scoreGrad(s) {
  if (s >= 70) return 'var(--green),var(--teal)';
  if (s >= 55) return 'var(--blue),var(--teal)';
  if (s >= 35) return 'var(--accent),var(--accent2)';
  return 'var(--red),var(--pink)';
}

function badgeClass(label) {
  var l = String(label).toLowerCase();
  if (l === 'high') return 'badge-green';
  if (l === 'low') return 'badge-blue';
  if (l === 'med' || l === 'medium') return 'badge-yellow';
  return 'badge-purple';
}

function platformColor(name) {
  var n = String(name).toLowerCase();
  if (n === 'linkedin') return '#0a66c2';
  if (n === 'facebook') return '#1877f2';
  if (n === 'instagram') return '#e4405f';
  if (n === 'youtube') return '#ff0000';
  return 'var(--accent)';
}

function ringOffset(score) {
  return 213.6 - (score / 100 * 213.6);
}

function generate(d) {
  var cs = d.categoryScores || {};
  var bars = d.barMetrics || [];
  var strengths = d.strengths || [];
  var gaps = d.gaps || [];
  var services = (d.servicesDeepDive || {}).services || [];
  var svcHighlight = (d.servicesDeepDive || {}).highlight || {};
  var comp = d.competitiveLandscape || {};
  var competitors = comp.competitors || [];
  var quickWins = d.quickWins || [];
  var aeo = d.aeoAnalysis || {};
  var pl = d.pipelineLite || {};
  var sm = d.socialMediaDiagnosis || {};
  var owner = sm.ownerProfile || {};
  var platforms = sm.platforms || [];
  var kpis = d.kpis || [];

  // Build bars HTML
  var barsHtml = bars.map(function(b) {
    return '<div class="bar-row"><div class="bar-label">' + esc(b.label) + '</div><div class="bar-track"><div class="bar-fill" style="width:' + b.score + '%;background:linear-gradient(90deg,' + scoreGrad(b.score) + ')"></div></div><div class="bar-score" style="color:' + scoreColor(b.score) + '">' + b.score + '</div></div>';
  }).join('');

  // Category scores for rings
  var catKeys = [['webPresence','Web Presence'],['seo','SEO'],['contentStrategy','Content'],['socialMedia','Social Media'],['brandIdentity','Brand'],['leadGeneration','Lead Gen']];
  var ringsHtml = catKeys.map(function(pair) {
    var val = cs[pair[0]] || 0;
    return '<div class="score-ring"><svg viewBox="0 0 80 80"><circle class="track" cx="40" cy="40" r="34"/><circle class="fill" cx="40" cy="40" r="34" stroke="' + scoreColor(val) + '" style="stroke-dasharray:213.6;stroke-dashoffset:' + ringOffset(val) + '"/></svg><div class="val">' + val + '</div></div><div style="text-align:center;font-size:.75rem;color:var(--text2);margin-top:4px">' + pair[1] + '</div>';
  }).join('');

  // KPI strip
  var kpiHtml = kpis.map(function(k) {
    return '<div class="kpi"><div class="val">' + esc(k.value) + '</div><div class="label">' + esc(k.label) + '</div></div>';
  }).join('');

  // Strengths
  var strengthsHtml = strengths.map(function(s) {
    return '<div class="strength-item"><div class="item-icon">&#10003;</div><div class="item-text"><strong>' + esc(s.title) + '</strong><p>' + esc(s.desc) + '</p></div></div>';
  }).join('');

  // Gaps
  var gapsHtml = gaps.map(function(g) {
    return '<div class="gap-item"><div class="item-icon">&#10007;</div><div class="item-text"><strong>' + esc(g.title) + '</strong><p>' + esc(g.desc) + '</p></div></div>';
  }).join('');

  // Services
  var servicesHtml = services.map(function(s) {
    return '<div class="bar-row"><div class="bar-label">' + esc(s.name) + '</div><div class="bar-track"><div class="bar-fill" style="width:' + s.score + '%;background:linear-gradient(90deg,' + scoreGrad(s.score) + ')"></div></div><div class="bar-score" style="color:' + scoreColor(s.score) + '">' + s.score + '</div></div><p style="color:var(--text2);font-size:.85rem;margin:0 0 12px 0">' + esc(s.desc) + '</p>';
  }).join('');

  // Competitors
  var compHtml = competitors.map(function(c) {
    return '<div class="competitor-row"><div class="competitor-name">' + esc(c.name) + '</div><div class="competitor-bar"><div class="competitor-fill" style="width:' + c.score + '%;background:linear-gradient(90deg,' + scoreGrad(c.score) + ')">' + esc(c.desc) + '</div></div><div class="competitor-score" style="color:' + scoreColor(c.score) + '">' + c.score + '</div></div>';
  }).join('');

  var advantagesHtml = (comp.advantages || []).map(function(a) {
    return '<div class="strength-item"><div class="item-icon">&#10003;</div><div class="item-text"><p>' + esc(a) + '</p></div></div>';
  }).join('');

  var threatsHtml = (comp.threats || []).map(function(t) {
    return '<div class="gap-item"><div class="item-icon">&#10007;</div><div class="item-text"><p>' + esc(t) + '</p></div></div>';
  }).join('');

  // Quick wins
  var winsHtml = quickWins.map(function(w, i) {
    return '<div class="action-card"><div class="action-rank">' + (i + 1) + '</div><div class="action-body"><h4>' + esc(w.title) + '</h4><p>' + esc(w.desc) + '</p><div class="action-meta"><span class="tag tag-impact">Impact: ' + esc(w.impact) + '</span><span class="tag tag-effort">Effort: ' + esc(w.effort) + '</span><span class="tag tag-timeline">Timeline: ' + esc(w.timeline) + '</span></div></div></div>';
  }).join('');

  // AEO
  var aeoRecsHtml = (aeo.recommendations || []).map(function(r) {
    return '<div class="strength-item"><div class="item-icon">&#10003;</div><div class="item-text"><p>' + esc(r) + '</p></div></div>';
  }).join('');
  var aeoProjHtml = (aeo.projections || []).map(function(p) {
    return '<div class="projection-row"><div class="projection-label">' + esc(p.label) + '</div><div class="projection-val up">' + esc(p.value) + '</div></div>';
  }).join('');

  // Pipeline Lite
  var plPhasesHtml = (pl.phases || []).map(function(p) {
    return '<div class="phase-card"><h4>' + esc(p.title) + '</h4><p>' + esc(p.desc) + '</p></div>';
  }).join('');
  var plProjHtml = (pl.projections || []).map(function(p) {
    return '<div class="projection-row"><div class="projection-label">' + esc(p.label) + '</div><div class="projection-val up">' + esc(p.value) + '</div></div>';
  }).join('');

  // Social Media Diagnosis — platform cards
  var platformsHtml = platforms.map(function(p) {
    var color = platformColor(p.name);
    var sHtml = (p.strengths || []).map(function(s) { return '<li>' + esc(s) + '</li>'; }).join('');
    var gHtml = (p.gaps || []).map(function(g) { return '<li>' + esc(g) + '</li>'; }).join('');
    var rHtml = (p.recommendations || []).map(function(r) { return '<li>' + esc(r) + '</li>'; }).join('');
    return '<div class="card" style="border-left:3px solid ' + color + '">' +
      '<h3 style="color:' + color + '">' + esc(p.name) + '</h3>' +
      '<div class="platform-grid">' +
        '<div><span class="stat-label">Followers</span><span class="stat-val">' + esc(p.followers || 'N/A') + '</span></div>' +
        '<div><span class="stat-label">Engagement</span><span class="stat-val">' + esc(p.engagement || 'N/A') + '</span></div>' +
        '<div><span class="stat-label">Post Freq</span><span class="stat-val">' + esc(p.postFreq || 'N/A') + '</span></div>' +
        '<div><span class="stat-label">Score</span><span class="stat-val" style="color:' + scoreColor(p.score || 0) + '">' + (p.score || 0) + '/100</span></div>' +
      '</div>' +
      (sHtml ? '<h4 style="color:var(--green);margin-top:12px">Strengths</h4><ul class="plat-list">' + sHtml + '</ul>' : '') +
      (gHtml ? '<h4 style="color:var(--red);margin-top:12px">Gaps</h4><ul class="plat-list">' + gHtml + '</ul>' : '') +
      (rHtml ? '<h4 style="color:var(--accent);margin-top:12px">Recommendations</h4><ul class="plat-list">' + rHtml + '</ul>' : '') +
    '</div>';
  }).join('');

  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + esc(d.businessName) + ' — Prospect Intelligence Dashboard</title><style>' +
    '*{margin:0;padding:0;box-sizing:border-box}' +
    ':root{--bg:#0c0f14;--surface:#161b24;--surface2:#1c2230;--border:#2a3142;--text:#e4e8ef;--text2:#8b95a8;--accent:#f0a500;--accent2:#ff6b35;--green:#22c55e;--red:#ef4444;--blue:#3b82f6;--purple:#a855f7;--teal:#14b8a6;--pink:#ec4899}' +
    'body{background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;padding:20px}' +
    '.dash{max-width:1100px;margin:0 auto}' +
    '.header{background:var(--surface);border-radius:16px;border:1px solid var(--border);padding:32px;margin-bottom:20px;text-align:center}' +
    '.header h1{font-size:1.8rem;color:var(--accent);margin-bottom:4px}' +
    '.header .tagline{color:var(--text2);font-size:1rem}' +
    '.header .overall{display:flex;align-items:center;justify-content:center;gap:16px;margin-top:16px}' +
    '.tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}' +
    '.tab{padding:10px 18px;background:var(--surface);border:1px solid var(--border);border-radius:10px;cursor:pointer;font-size:.85rem;color:var(--text2);transition:all .2s}' +
    '.tab:hover{border-color:var(--accent)}' +
    '.tab.active{background:var(--accent);color:#000;border-color:var(--accent);font-weight:700}' +
    '.panel{display:none}' +
    '.panel.active{display:block}' +
    '.card{background:var(--surface);border-radius:14px;border:1px solid var(--border);padding:24px;margin-bottom:16px}' +
    '.card h3{font-size:1.1rem;margin-bottom:12px}' +
    '.grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px}' +
    '@media(max-width:768px){.grid2{grid-template-columns:1fr}.rings-grid{grid-template-columns:repeat(3,1fr) !important}}' +
    '.rings-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:12px;text-align:center;margin:20px 0}' +
    '.score-ring{position:relative;width:80px;height:80px;margin:0 auto}' +
    '.score-ring svg{width:80px;height:80px;transform:rotate(-90deg)}' +
    '.score-ring .track{fill:none;stroke:var(--border);stroke-width:6}' +
    '.score-ring .fill{fill:none;stroke-width:6;stroke-linecap:round;transition:stroke-dashoffset .8s}' +
    '.score-ring .val{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:1.1rem;font-weight:700}' +
    '.kpi-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:16px 0}' +
    '.kpi{background:var(--surface2);border-radius:10px;padding:16px;text-align:center}' +
    '.kpi .val{font-size:1.3rem;font-weight:700;color:var(--accent)}' +
    '.kpi .label{font-size:.75rem;color:var(--text2);margin-top:4px}' +
    '.bar-row{display:flex;align-items:center;gap:10px;margin:8px 0}' +
    '.bar-label{width:140px;font-size:.85rem;color:var(--text2);flex-shrink:0}' +
    '.bar-track{flex:1;height:20px;background:var(--surface2);border-radius:10px;overflow:hidden}' +
    '.bar-fill{height:100%;border-radius:10px;transition:width .6s}' +
    '.bar-score{width:36px;text-align:right;font-weight:700;font-size:.9rem}' +
    '.strength-item,.gap-item{display:flex;gap:10px;margin:8px 0}' +
    '.item-icon{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.8rem;flex-shrink:0}' +
    '.strength-item .item-icon{background:rgba(34,197,94,.15);color:var(--green)}' +
    '.gap-item .item-icon{background:rgba(239,68,68,.15);color:var(--red)}' +
    '.item-text p{color:var(--text2);font-size:.85rem;margin-top:2px}' +
    '.highlight-box{background:linear-gradient(135deg,rgba(240,165,0,.1),rgba(255,107,53,.1));border:1px solid rgba(240,165,0,.3);border-radius:12px;padding:20px;margin:16px 0}' +
    '.highlight-box h3{color:var(--accent);font-size:1rem}' +
    '.highlight-box p{color:var(--text2);font-size:.9rem;margin-top:6px}' +
    '.competitor-row{display:flex;align-items:center;gap:10px;margin:10px 0}' +
    '.competitor-name{width:120px;font-size:.85rem;flex-shrink:0}' +
    '.competitor-bar{flex:1;height:26px;background:var(--surface2);border-radius:8px;overflow:hidden;position:relative}' +
    '.competitor-fill{height:100%;border-radius:8px;display:flex;align-items:center;padding-left:8px;font-size:.75rem;color:#fff}' +
    '.competitor-score{width:36px;text-align:right;font-weight:700;font-size:.9rem}' +
    '.action-card{display:flex;gap:14px;background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:18px;margin:10px 0}' +
    '.action-rank{width:32px;height:32px;background:var(--accent);color:#000;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0}' +
    '.action-body h4{margin-bottom:4px}' +
    '.action-body p{color:var(--text2);font-size:.85rem;margin-bottom:8px}' +
    '.action-meta{display:flex;gap:8px;flex-wrap:wrap}' +
    '.tag{padding:3px 10px;border-radius:20px;font-size:.75rem;font-weight:600}' +
    '.tag-impact{background:rgba(34,197,94,.15);color:var(--green)}' +
    '.tag-effort{background:rgba(59,130,246,.15);color:var(--blue)}' +
    '.tag-timeline{background:rgba(168,85,247,.15);color:var(--purple)}' +
    '.projection-row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)}' +
    '.projection-label{color:var(--text2)}' +
    '.projection-val{font-weight:700}' +
    '.projection-val.up{color:var(--green)}' +
    '.phase-card{background:var(--surface2);border-radius:10px;padding:18px;margin:10px 0}' +
    '.phase-card h4{color:var(--accent);margin-bottom:6px}' +
    '.phase-card p{color:var(--text2);font-size:.85rem}' +
    '.platform-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0}' +
    '.stat-label{display:block;font-size:.75rem;color:var(--text2)}' +
    '.stat-val{font-weight:700;font-size:.95rem}' +
    '.plat-list{list-style:none;padding:0;margin:6px 0}' +
    '.plat-list li{color:var(--text2);font-size:.85rem;padding:3px 0;padding-left:14px;position:relative}' +
    '.plat-list li::before{content:"\\2022";position:absolute;left:0;color:var(--text2)}' +
    '.footer{text-align:center;padding:30px;color:var(--text2);font-size:.8rem}' +
    '.footer a{color:var(--accent)}' +
    '</style></head><body><div class="dash">' +

    // Header
    '<div class="header"><h1>' + esc(d.businessName) + '</h1><p class="tagline">' + esc(d.tagline) + '</p>' +
    '<div class="overall"><div class="score-ring"><svg viewBox="0 0 80 80"><circle class="track" cx="40" cy="40" r="34"/><circle class="fill" cx="40" cy="40" r="34" stroke="' + scoreColor(d.overallScore || 0) + '" style="stroke-dasharray:213.6;stroke-dashoffset:' + ringOffset(d.overallScore || 0) + '"/></svg><div class="val">' + (d.overallScore || 0) + '</div></div><div style="text-align:left"><div style="font-size:.85rem;color:var(--text2)">Overall Score</div><div style="font-weight:700;font-size:1.1rem">' + esc(d.industry || 'Business') + '</div></div></div></div>' +

    // Tabs
    '<div class="tabs">' +
      '<div class="tab active" data-tab="overview">Overview</div>' +
      '<div class="tab" data-tab="social">Social Media Diagnosis</div>' +
      '<div class="tab" data-tab="services">Services Deep Dive</div>' +
      '<div class="tab" data-tab="competitive">Competitive Landscape</div>' +
      '<div class="tab" data-tab="gaps">Gaps &amp; Quick Wins</div>' +
      '<div class="tab" data-tab="aeo">AEO Analysis</div>' +
      '<div class="tab" data-tab="pipeline">Pipeline Lite</div>' +
    '</div>' +

    // Overview Panel
    '<div class="panel active" id="overview">' +
      '<div class="card"><h3>Executive Summary</h3><p style="color:var(--text2)">' + esc(d.executiveSummary) + '</p></div>' +
      '<div class="kpi-strip">' + kpiHtml + '</div>' +
      '<div class="card"><h3>Category Scores</h3><div class="rings-grid">' + ringsHtml + '</div></div>' +
      '<div class="card"><h3>Performance Metrics</h3>' + barsHtml + '</div>' +
      '<div class="grid2"><div class="card"><h3 style="color:var(--green)">Key Strengths</h3>' + strengthsHtml + '</div>' +
      '<div class="card"><h3 style="color:var(--red)">Key Gaps</h3>' + gapsHtml + '</div></div>' +
    '</div>' +

    // Social Media Diagnosis Panel
    '<div class="panel" id="social">' +
      '<div class="card"><h3>Owner Profile</h3>' +
        '<p><strong>' + esc(owner.name || d.businessName) + '</strong>' + (owner.title ? ' — ' + esc(owner.title) : '') + '</p>' +
        '<p style="color:var(--text2);margin-top:6px">' + esc(owner.summary || '') + '</p>' +
      '</div>' +
      platformsHtml +
    '</div>' +

    // Services Deep Dive Panel
    '<div class="panel" id="services">' +
      '<div class="card"><h3>Services Analysis</h3>' + servicesHtml + '</div>' +
      (svcHighlight.title ? '<div class="highlight-box"><h3>' + esc(svcHighlight.title) + '</h3><p>' + esc(svcHighlight.desc) + '</p></div>' : '') +
    '</div>' +

    // Competitive Landscape Panel
    '<div class="panel" id="competitive">' +
      '<div class="card"><h3>Competitive Overview</h3>' + compHtml + '</div>' +
      '<div class="grid2"><div class="card"><h3 style="color:var(--green)">Advantages</h3>' + advantagesHtml + '</div>' +
      '<div class="card"><h3 style="color:var(--red)">Threats</h3>' + threatsHtml + '</div></div>' +
    '</div>' +

    // Gaps & Quick Wins Panel
    '<div class="panel" id="gaps">' +
      '<div class="card"><h3>Top Quick Wins</h3>' + winsHtml + '</div>' +
    '</div>' +

    // AEO Analysis Panel
    '<div class="panel" id="aeo">' +
      '<div class="card"><div style="display:flex;align-items:center;gap:16px;margin-bottom:16px"><div class="score-ring"><svg viewBox="0 0 80 80"><circle class="track" cx="40" cy="40" r="34"/><circle class="fill" cx="40" cy="40" r="34" stroke="' + scoreColor(aeo.score || 0) + '" style="stroke-dasharray:213.6;stroke-dashoffset:' + ringOffset(aeo.score || 0) + '"/></svg><div class="val">' + (aeo.score || 0) + '</div></div><div><h3>AEO Readiness</h3><p style="color:var(--text2);font-size:.9rem">' + esc(aeo.summary) + '</p></div></div>' +
        aeoRecsHtml +
      '</div>' +
      '<div class="card"><h3>Projections</h3>' + aeoProjHtml + '</div>' +
    '</div>' +

    // Pipeline Lite Panel
    '<div class="panel" id="pipeline">' +
      '<div class="highlight-box"><h3>Pipeline Lite by Join Remote Sales</h3><p>AI-powered sales pipeline recommendations based on your digital presence analysis.</p></div>' +
      '<div class="card"><h3>Implementation Phases</h3>' + plPhasesHtml + '</div>' +
      '<div class="card"><h3>Projected Impact</h3>' + plProjHtml + '</div>' +
    '</div>' +

    // Footer
    '<div class="footer">Generated by <a href="#">Pipeline Lite</a> — Join Remote Sales</div>' +
    '</div>' +

    // Tab switching JS — safe DOM methods only
    '<script>' +
    'document.addEventListener("DOMContentLoaded",function(){' +
      'var tabs=document.querySelectorAll(".tab");' +
      'var panels=document.querySelectorAll(".panel");' +
      'tabs.forEach(function(t){' +
        't.addEventListener("click",function(){' +
          'tabs.forEach(function(x){x.classList.remove("active")});' +
          'panels.forEach(function(x){x.classList.remove("active")});' +
          't.classList.add("active");' +
          'var id=t.getAttribute("data-tab");' +
          'var p=document.getElementById(id);' +
          'if(p)p.classList.add("active");' +
        '});' +
      '});' +
    '});' +
    '</script></body></html>';
}

module.exports = { generate };
