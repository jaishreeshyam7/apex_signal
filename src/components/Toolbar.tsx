import { useState, type ChangeEvent } from 'react';
import type { StakeholderType } from '../types';
import { NODE_COLORS, LINK_STATE_COLORS } from './ForceGraph';
import { Search, X, Filter } from 'lucide-react';
import styles from './Toolbar.module.css';

const ALL_TYPES: { type: StakeholderType; label: string }[] = [
  { type: 'government', label: 'Government' },
  { type: 'regulator', label: 'Regulator' },
  { type: 'ngo', label: 'NGO' },
  { type: 'financier', label: 'Financier' },
  { type: 'competitor', label: 'Competitor' },
  { type: 'partner', label: 'Partner' },
  { type: 'supplier', label: 'Supplier' },
  { type: 'customer', label: 'Customer' },
  { type: 'union', label: 'Union' },
  { type: 'individual', label: 'Individual' },
];

interface ToolbarProps {
  filterType: string | null;
  searchQuery: string;
  onFilterChange: (type: string | null) => void;
  onSearchChange: (query: string) => void;
  totalNodes: number;
}

const Toolbar = ({ filterType, searchQuery, onFilterChange, onSearchChange, totalNodes }: ToolbarProps) => {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  return (
    <div className={styles.toolbar}>
      {/* Search */}
      <div className={styles.searchWrap}>
        <Search size={15} className={styles.searchIcon} />
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search stakeholders…"
          value={searchQuery}
          onChange={handleSearch}
        />
        {searchQuery && (
          <button className={styles.clearBtn} onClick={() => onSearchChange('')}>
            <X size={13} />
          </button>
        )}
      </div>

      {/* Filter toggle */}
      <button
        className={`${styles.filterToggle} ${filtersOpen ? styles.active : ''}`}
        onClick={() => setFiltersOpen(v => !v)}
      >
        <Filter size={14} />
        <span>Filter</span>
        {filterType && <span className={styles.filterDot} />}
      </button>

      {/* Stats */}
      <span className={styles.stat}>{totalNodes} nodes</span>

      {/* Legend */}
      <div className={styles.legendSep} />
      <div className={styles.legend}>
        {Object.entries(LINK_STATE_COLORS).map(([state, color]) => (
          <div key={state} className={styles.legendItem}>
            <span className={styles.legendLine} style={{ background: color }} />
            <span className={styles.legendText}>{state}</span>
          </div>
        ))}
      </div>

      {/* Filter pills dropdown */}
      {filtersOpen && (
        <div className={styles.filterPanel}>
          <button
            className={`${styles.filterPill} ${!filterType ? styles.activePill : ''}`}
            onClick={() => onFilterChange(null)}
          >
            All
          </button>
          {ALL_TYPES.map(({ type, label }) => (
            <button
              key={type}
              className={`${styles.filterPill} ${filterType === type ? styles.activePill : ''}`}
              style={filterType === type ? { background: `${NODE_COLORS[type]}22`, borderColor: NODE_COLORS[type], color: NODE_COLORS[type] } : {}}
              onClick={() => onFilterChange(filterType === type ? null : type)}
            >
              <span className={styles.dot} style={{ background: NODE_COLORS[type] }} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Toolbar;
