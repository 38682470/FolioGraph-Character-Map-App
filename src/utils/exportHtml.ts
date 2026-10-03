import { LiteraryMap } from '../types';

export function generateStandaloneHtml(map: LiteraryMap): string {
  const mapJson = JSON.stringify(map);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${map.title} - Literary Character Web</title>
  <script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #ffffff; color: #1e293b; overflow: hidden; height: 100vh; display: flex; flex-direction: column; }
    header { height: 56px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; background: #ffffff; z-index: 10; }
    .header-title { font-size: 18px; font-weight: 700; color: #0f172a; }
    .header-meta { font-size: 13px; color: #64748b; margin-left: 12px; }
    .main-container { flex: 1; display: flex; height: calc(100vh - 56px); }
    #canvas-container { flex: 7; position: relative; background: radial-gradient(circle, #f8fafc 0%, #f1f5f9 100%); overflow: hidden; }
    #sidebar { flex: 3; max-width: 420px; border-left: 1px solid #e2e8f0; background: #ffffff; overflow-y: auto; padding: 24px; }
    .controls { position: absolute; top: 16px; left: 16px; display: flex; gap: 8px; align-items: center; background: rgba(255,255,255,0.9); padding: 8px 12px; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .btn { background: #f8fafc; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .btn:hover { background: #e2e8f0; }
    .legend { position: absolute; bottom: 20px; left: 20px; background: rgba(255,255,255,0.95); border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .legend-title { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 8px; }
    .legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; margin-bottom: 4px; }
    .legend-dot { width: 12px; height: 3px; border-radius: 2px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
    .char-name { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
    .char-role { font-size: 12px; color: #64748b; margin-bottom: 12px; }
    .char-bio { font-size: 13px; line-height: 1.6; color: #334155; }
    .rel-item { border-left: 3px solid #cbd5e1; padding: 8px 12px; margin-bottom: 8px; background: #f1f5f9; border-radius: 0 6px 6px 0; }
    .rel-target { font-weight: 600; font-size: 13px; color: #0f172a; }
    .rel-type { font-size: 11px; font-weight: 600; text-transform: uppercase; margin-top: 2px; }
    .rel-notes { font-size: 12px; color: #475569; margin-top: 4px; }
    svg text { user-select: none; }
  </style>
</head>
<body>
  <header>
    <div style="display:flex; align-items:center;">
      <span class="header-title">${map.title}</span>
      <span class="header-meta">by ${map.author} · ${map.characters.length} characters, ${map.relationships.length} relationships</span>
    </div>
    <div>
      <button class="btn" onclick="resetGraph()">Snap to Center</button>
      <button class="btn" onclick="clearFocus()">Clear Selection</button>
    </div>
  </header>

  <div class="main-container">
    <div id="canvas-container">
      <div class="controls">
        <label style="font-size:12px; color:#475569;">Spacing: </label>
        <input type="range" id="length-slider" min="80" max="300" value="160" oninput="updateLinkDistance(this.value)">
      </div>
      <div class="legend">
        <div class="legend-title">Relationship Types</div>
        <div class="legend-item"><div class="legend-dot" style="background:#84cc16;"></div> Ally / Friend</div>
        <div class="legend-item"><div class="legend-dot" style="background:#f97316;"></div> Authority / Power</div>
        <div class="legend-item"><div class="legend-dot" style="background:#0ea5e9;"></div> Family</div>
        <div class="legend-item"><div class="legend-dot" style="background:#a855f7;"></div> Romantic</div>
        <div class="legend-item"><div class="legend-dot" style="background:#ef4444;"></div> Rival / Enemy</div>
        <div class="legend-item"><div class="legend-dot" style="background:#64748b;"></div> Other</div>
      </div>
      <svg id="network-svg" width="100%" height="100%"></svg>
    </div>

    <div id="sidebar">
      <div id="sidebar-content">
        <div class="card">
          <div class="char-name">${map.title}</div>
          <div class="char-role">Author: ${map.author}</div>
          <div class="char-bio">${map.description}</div>
        </div>
        <p style="font-size:13px; color:#64748b;">Click any character node in the graph to inspect relationships and full literary background.</p>
      </div>
    </div>
  </div>

  <script>
    const mapData = ${mapJson};
    const colorMap = {
      ally: '#84cc16',
      authority: '#f97316',
      family: '#0ea5e9',
      romantic: '#a855f7',
      rival: '#ef4444',
      other: '#64748b'
    };

    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;
    let selectedId = null;

    const svg = d3.select('#network-svg')
      .attr('viewBox', [-width / 2, -height / 2, width, height]);

    const g = svg.append('g');

    // Zoom
    const zoom = d3.zoom()
      .scaleExtent([0.2, 4])
      .on('zoom', (e) => g.attr('transform', e.transform));
    svg.call(zoom);

    // D3 links and nodes
    const nodes = mapData.characters.map(c => ({ ...c }));
    const links = mapData.relationships.map(r => ({
      ...r,
      source: r.sourceId,
      target: r.targetId
    }));

    let linkForce = d3.forceLink(links).id(d => d.id).distance(160);
    const simulation = d3.forceSimulation(nodes)
      .force('link', linkForce)
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(0, 0))
      .force('collision', d3.forceCollide().radius(40));

    // Links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', d => colorMap[d.type] || '#94a3b8')
      .attr('stroke-width', d => d.tier === 'primary' ? 2.5 : 1.5)
      .attr('stroke-opacity', 0.85);

    // Nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
      .on('click', (event, d) => selectCharacter(d.id));

    // Node circle
    node.append('circle')
      .attr('r', d => d.tier === 'lead' ? 28 : d.tier === 'supporting' ? 22 : 16)
      .attr('fill', '#ffffff')
      .attr('stroke', d => d.tier === 'lead' ? '#8b5cf6' : d.tier === 'supporting' ? '#0ea5e9' : '#94a3b8')
      .attr('stroke-width', 3);

    // Initials text inside
    node.append('text')
      .text(d => d.displayName.slice(0, 2).toUpperCase())
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('font-size', d => d.tier === 'lead' ? '14px' : '11px')
      .attr('font-weight', '700')
      .attr('fill', d => d.tier === 'lead' ? '#8b5cf6' : d.tier === 'supporting' ? '#0284c7' : '#475569');

    // Label below
    node.append('text')
      .text(d => d.displayName)
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.tier === 'lead' ? '40px' : '34px')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('fill', '#1e293b');

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', d => \`translate(\${d.x},\${d.y})\`);
    });

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    function selectCharacter(id) {
      selectedId = id;
      const char = mapData.characters.find(c => c.id === id);
      if (!char) return;

      const connectedIds = new Set([id]);
      mapData.relationships.forEach(r => {
        if (r.sourceId === id) connectedIds.add(r.targetId);
        if (r.targetId === id) connectedIds.add(r.sourceId);
      });

      node.attr('opacity', d => connectedIds.has(d.id) ? 1 : 0.15);
      link.attr('opacity', d => (d.source.id === id || d.target.id === id) ? 1 : 0.08);

      renderSidebar(char);
    }

    function clearFocus() {
      selectedId = null;
      node.attr('opacity', 1);
      link.attr('opacity', 0.85);
      document.getElementById('sidebar-content').innerHTML = \`
        <div class="card">
          <div class="char-name">\${mapData.title}</div>
          <div class="char-role">Author: \${mapData.author}</div>
          <div class="char-bio">\${mapData.description}</div>
        </div>
        <p style="font-size:13px; color:#64748b;">Click any character node in the graph to inspect relationships and full literary background.</p>
      \`;
    }

    function renderSidebar(c) {
      const rels = mapData.relationships.filter(r => r.sourceId === c.id || r.targetId === c.id);
      let relsHtml = '';
      rels.forEach(r => {
        const otherId = r.sourceId === c.id ? r.targetId : r.sourceId;
        const otherChar = mapData.characters.find(ch => ch.id === otherId);
        const color = colorMap[r.type] || '#64748b';
        relsHtml += \`
          <div class="rel-item" style="border-left-color: \${color}">
            <div class="rel-target">\${otherChar ? otherChar.displayName : otherId}</div>
            <div class="rel-type" style="color: \${color}">\${r.customLabel || r.type} (\${r.tier})</div>
            \${r.notes ? \`<div class="rel-notes">\${r.notes}</div>\` : ''}
          </div>
        \`;
      });

      document.getElementById('sidebar-content').innerHTML = \`
        <div class="card">
          <div class="char-name">\${c.fullName}</div>
          <div class="char-role">\${c.archetypeTag || c.tier} · \${c.gender || ''} · \${c.ageGroup || ''}</div>
          <div class="char-bio">\${c.overviewBio || 'No overview available.'}</div>
        </div>
        <h3 style="font-size:14px; font-weight:700; margin-bottom:12px; color:#0f172a;">Relationships (\${rels.length})</h3>
        <div>\${relsHtml || '<p style="font-size:12px; color:#94a3b8;">No direct connections.</p>'}</div>
      \`;
    }

    function resetGraph() {
      svg.transition().duration(750).call(
        zoom.transform,
        d3.zoomIdentity
      );
    }

    function updateLinkDistance(val) {
      linkForce.distance(Number(val));
      simulation.alpha(0.3).restart();
    }
  </script>
</body>
</html>`;
}
