// ForceGraph.tsx
// This is the core of the whole thing. D3 and React don't naturally play well
// together — React wants to own the DOM, D3 wants to mutate it directly.
// My solution: React mounts the <svg> container, D3 gets everything inside it.
// Splitting visual updates into a second useEffect (no simulation restart) was
// the fix that finally made highlighting feel smooth.
import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import type { GraphData, NodeData, LinkData, StakeholderType, RelationshipState } from '../types';
import styles from './ForceGraph.module.css';

interface ForceGraphProps {
  data: GraphData;
  onNodeClick: (node: NodeData) => void;
  selectedNode: NodeData | null;
  filterType: string | null;
  searchQuery: string;
}

export const NODE_COLORS: Record<StakeholderType, string> = {
  company: '#f59e0b',
  government: '#3b82f6',
  regulator: '#0ea5e9',
  ngo: '#10b981',
  competitor: '#ef4444',
  financier: '#8b5cf6',
  supplier: '#64748b',
  union: '#f97316',
  customer: '#14b8a6',
  partner: '#d946ef',
  individual: '#e2e8f0',
};

export const LINK_STATE_COLORS: Record<RelationshipState, string> = {
  stable: '#475569',
  improving: '#10b981',
  deteriorating: '#ef4444',
};

// Node radius mapped to influence level.
// I debated deriving this from relationship strength instead,
// but influence and strength are genuinely different things —
// Milieudefensie has high structural influence even on days when
// nothing is happening between them and Shell.
const INFLUENCE_RADIUS: Record<string, number> = {
  critical: 22,
  high: 16,
  medium: 12,
  low: 9,
};

const ForceGraph = ({ data, onNodeClick, selectedNode, filterType, searchQuery }: ForceGraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<NodeData, LinkData> | null>(null);

  // Derive sets of visible/highlighted nodes
  const { visibleNodeIds, highlightedNodeIds } = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let visibleNodeIds: Set<string> | null = null;
    let highlightedNodeIds: Set<string> = new Set();

    if (filterType) {
      visibleNodeIds = new Set(
        data.nodes.filter(n => n.type === filterType || n.id === 'shell').map(n => n.id)
      );
    }
    if (query) {
      highlightedNodeIds = new Set(
        data.nodes
          .filter(n => n.name.toLowerCase().includes(query) || n.description.toLowerCase().includes(query))
          .map(n => n.id)
      );
    }
    if (selectedNode) {
      highlightedNodeIds.add(selectedNode.id);
      data.links.forEach(l => {
        const srcId = typeof l.source === 'string' ? l.source : l.source.id;
        const tgtId = typeof l.target === 'string' ? l.target : l.target.id;
        if (srcId === selectedNode.id || tgtId === selectedNode.id) {
          highlightedNodeIds.add(srcId);
          highlightedNodeIds.add(tgtId);
        }
      });
    }

    return { visibleNodeIds, highlightedNodeIds };
  }, [data, filterType, searchQuery, selectedNode]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', [0, 0, width, height]);

    // Defs: arrow markers and glow filter
    const defs = svg.append('defs');

    // Glow filter
    const filter = defs.append('filter').attr('id', 'glow').attr('x', '-30%').attr('y', '-30%').attr('width', '160%').attr('height', '160%');
    filter.append('feGaussianBlur').attr('in', 'SourceGraphic').attr('stdDeviation', '4').attr('result', 'blur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'blur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Arrow markers
    (['improving', 'deteriorating', 'stable'] as RelationshipState[]).forEach(state => {
      defs.append('marker')
        .attr('id', `arrow-${state}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 20)
        .attr('refY', 0)
        .attr('markerWidth', 5)
        .attr('markerHeight', 5)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', LINK_STATE_COLORS[state])
        .attr('opacity', 0.7);
    });

    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', event => { g.attr('transform', event.transform); });
    svg.call(zoom);

    // Deep copy so D3 mutates its own instances
    const nodes: NodeData[] = data.nodes.map(d => ({ ...d }));
    const links: LinkData[] = data.links.map(d => ({ ...d }));

    // Tuned these force values through a lot of trial and error.
    // -420 charge felt right for 35 nodes — strong enough to keep them from
    // clumping but not so strong that related nodes fly apart.
    // The link distance being inversely proportional to strength means
    // high-strength relationships (QatarEnergy, BlackRock) sit closer to Shell.
    const simulation = d3.forceSimulation<NodeData>(nodes)
      .force('link', d3.forceLink<NodeData, LinkData>(links).id(d => d.id).distance(d => 130 - (d.strength || 5) * 4))
      .force('charge', d3.forceManyBody().strength(-420))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide<NodeData>().radius(d => INFLUENCE_RADIUS[d.influence] + 24))
      .force('x', d3.forceX(width / 2).strength(0.04))
      .force('y', d3.forceY(height / 2).strength(0.04));
    simulationRef.current = simulation;

    // Link lines
    const linkGroup = g.append('g').attr('class', 'links');
    const link = linkGroup.selectAll<SVGLineElement, LinkData>('line')
      .data(links)
      .join('line')
      .attr('stroke', d => LINK_STATE_COLORS[d.state])
      .attr('stroke-opacity', 0.5)
      .attr('stroke-width', d => Math.max(1, d.strength / 3))
      .attr('stroke-dasharray', d => d.type === 'adversarial' ? '6,4' : d.type === 'regulatory' ? '2,2' : 'none')
      .attr('marker-end', d => `url(#arrow-${d.state})`);

    // Node groups
    const nodeGroup = g.append('g').attr('class', 'nodes');
    const node = nodeGroup.selectAll<SVGGElement, NodeData>('g')
      .data(nodes)
      .join('g')
      .attr('class', styles.nodeG)
      .call(drag(simulation) as never)
      .on('click', (_e, d) => onNodeClick(d));

    // Outer glow ring (only for shell)
    node.filter(d => d.id === 'shell').append('circle')
      .attr('r', 30)
      .attr('fill', 'none')
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.3)
      .attr('filter', 'url(#glow)');

    // Node circles
    node.append('circle')
      .attr('class', styles.nodeCircle)
      .attr('r', d => INFLUENCE_RADIUS[d.influence])
      .attr('fill', d => NODE_COLORS[d.type] || '#999')
      .attr('stroke', '#0f172a')
      .attr('stroke-width', d => d.id === 'shell' ? 3 : 1.5);

    // Labels
    node.append('text')
      .attr('class', styles.nodeLabel)
      .attr('dy', d => INFLUENCE_RADIUS[d.influence] + 14)
      .attr('text-anchor', 'middle')
      .attr('fill', '#cbd5e1')
      .attr('font-size', d => d.id === 'shell' ? '13px' : '11px')
      .attr('font-weight', d => d.id === 'shell' ? '700' : '400')
      .text(d => d.name);

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as NodeData).x!)
        .attr('y1', d => (d.source as NodeData).y!)
        .attr('x2', d => (d.target as NodeData).x!)
        .attr('y2', d => (d.target as NodeData).y!);
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => { simulation.stop(); };
  }, [data]);

  // Separate effect for visual updates without re-running simulation
  // Took me a while to figure out this needed to be a separate useEffect.
  // Originally had it all in one and the graph kept restarting every time
  // you clicked a node, which felt terrible.
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const anyFilter = filterType !== null || searchQuery.trim() !== '' || selectedNode !== null;

    svg.selectAll<SVGGElement, NodeData>('.nodes g').each(function(d) {
      const el = d3.select(this);
      const isVisible = !visibleNodeIds || visibleNodeIds.has(d.id);
      const isHighlighted = highlightedNodeIds.has(d.id);
      const dimmed = anyFilter && !isHighlighted;

      el.select('circle').attr('opacity', dimmed ? 0.15 : 1);
      el.select('text').attr('opacity', dimmed ? 0.1 : isHighlighted || !anyFilter ? 1 : 0.3);
      el.attr('opacity', isVisible ? 1 : 0.2);

      if (d.id === selectedNode?.id) {
        el.select('circle').attr('stroke', '#ffffff').attr('stroke-width', 3).attr('filter', 'url(#glow)');
      } else {
        el.select('circle').attr('stroke', '#0f172a').attr('stroke-width', d.id === 'shell' ? 3 : 1.5).attr('filter', null);
      }
    });

    svg.selectAll<SVGLineElement, LinkData>('.links line').each(function(d) {
      const srcId = typeof d.source === 'string' ? d.source : d.source.id;
      const tgtId = typeof d.target === 'string' ? d.target : d.target.id;
      const connected = selectedNode && (srcId === selectedNode.id || tgtId === selectedNode.id);
      const opacity = anyFilter ? (connected ? 0.9 : 0.05) : 0.5;
      d3.select(this).attr('stroke-opacity', opacity).attr('stroke-width', connected ? (d.strength / 2.5) : Math.max(1, d.strength / 3));
    });
  }, [selectedNode, filterType, searchQuery, visibleNodeIds, highlightedNodeIds]);

  const drag = (simulation: d3.Simulation<NodeData, LinkData>) => {
    function dragstarted(event: d3.D3DragEvent<SVGGElement, NodeData, NodeData>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    function dragged(event: d3.D3DragEvent<SVGGElement, NodeData, NodeData>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    function dragended(event: d3.D3DragEvent<SVGGElement, NodeData, NodeData>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
    return d3.drag<SVGGElement, NodeData>().on('start', dragstarted).on('drag', dragged).on('end', dragended);
  };

  return (
    <div ref={containerRef} className={styles.graphWrapper}>
      <svg ref={svgRef} />
    </div>
  );
};

export default ForceGraph;
