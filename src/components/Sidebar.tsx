import type { NodeData, LinkData, RelationshipState } from '../types';
import { NODE_COLORS, LINK_STATE_COLORS } from './ForceGraph';
import styles from './Sidebar.module.css';
import { X, TrendingUp, TrendingDown, Minus, Globe, Zap } from 'lucide-react';

interface SidebarProps {
  node: NodeData | null;
  links: LinkData[];
  onClose: () => void;
}

const StateIcon = ({ state }: { state: RelationshipState }) => {
  if (state === 'improving') return <TrendingUp size={14} className={styles.iconImproving} />;
  if (state === 'deteriorating') return <TrendingDown size={14} className={styles.iconDeteriorating} />;
  return <Minus size={14} className={styles.iconStable} />;
};

const INFLUENCE_LABEL: Record<string, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const Sidebar = ({ node, links, onClose }: SidebarProps) => {
  if (!node) {
    return (
      <aside className={styles.sidebarEmpty}>
        <div className={styles.emptyInner}>
          <div className={styles.emptyIcon}>
            <Zap size={36} />
          </div>
          <p className={styles.emptyTitle}>Select a Stakeholder</p>
          <p className={styles.emptySubtitle}>Click any node in the graph to view its relationship details with Shell.</p>
        </div>
      </aside>
    );
  }

  const nodeRels = links.filter(l => {
    const src = typeof l.source === 'string' ? l.source : l.source.id;
    const tgt = typeof l.target === 'string' ? l.target : l.target.id;
    return src === node.id || tgt === node.id;
  });

  // Group by state
  const deteriorating = nodeRels.filter(r => r.state === 'deteriorating');
  const improving = nodeRels.filter(r => r.state === 'improving');
  const stable = nodeRels.filter(r => r.state === 'stable');

  const color = NODE_COLORS[node.type] || '#94a3b8';

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader} style={{ borderTopColor: color }}>
        <div className={styles.headerMeta}>
          <span className={styles.typePill} style={{ background: `${color}22`, color }}>
            {node.type.charAt(0).toUpperCase() + node.type.slice(1)}
          </span>
          <span className={styles.countryTag}>
            <Globe size={11} style={{ marginRight: 4 }} />
            {node.country}
          </span>
        </div>
        <div className={styles.headerTitleRow}>
          <h2 className={styles.nodeName}>{node.name}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className={styles.influenceBadge} data-level={node.influence}>
          Influence: <strong>{INFLUENCE_LABEL[node.influence]}</strong>
        </div>
      </div>

      <div className={styles.aboutSection}>
        <h3 className={styles.sectionLabel}>About</h3>
        <p className={styles.description}>{node.description}</p>
      </div>

      <div className={styles.relSection}>
        <h3 className={styles.sectionLabel}>Relationships ({nodeRels.length})</h3>

        {/* Summary pills */}
        <div className={styles.statSummary}>
          <div className={styles.statItem} data-state="deteriorating">
            <TrendingDown size={14} /> {deteriorating.length} Deteriorating
          </div>
          <div className={styles.statItem} data-state="stable">
            <Minus size={14} /> {stable.length} Stable
          </div>
          <div className={styles.statItem} data-state="improving">
            <TrendingUp size={14} /> {improving.length} Improving
          </div>
        </div>

        <div className={styles.relList}>
          {[...deteriorating, ...stable, ...improving].map((rel, i) => {
            const srcId = typeof rel.source === 'string' ? rel.source : rel.source.id;
            const tgtId = typeof rel.target === 'string' ? rel.target : rel.target.id;
            const otherId = srcId === node.id ? tgtId : srcId;
            const otherNode = links
              .map(l => [l.source, l.target])
              .flat()
              .find(n => (typeof n === 'string' ? n : n.id) === otherId);
            const otherName = typeof otherNode === 'string' ? otherNode : (otherNode as NodeData)?.name || otherId;

            const stateColor = LINK_STATE_COLORS[rel.state];
            const dirLabel = rel.direction === 'bilateral' ? '⇄' : rel.direction === 'inbound' ? '→ Shell' : 'Shell →';

            return (
              <div key={i} className={styles.relCard} style={{ borderLeftColor: stateColor }}>
                <div className={styles.relCardTop}>
                  <span className={styles.relTarget}>{otherName}</span>
                  <span className={styles.relDir}>{dirLabel}</span>
                </div>
                <div className={styles.relMeta}>
                  <span className={styles.relStatePill} style={{ color: stateColor, background: `${stateColor}18` }}>
                    <StateIcon state={rel.state} /> {rel.state}
                  </span>
                  <span className={styles.relType}>{rel.type}</span>
                  <span className={styles.relStrength}>
                    {'▮'.repeat(rel.strength).padEnd(10, '▯')}
                    <span className={styles.strengthNum}>{rel.strength}/10</span>
                  </span>
                </div>
                <p className={styles.relDesc}>{rel.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
