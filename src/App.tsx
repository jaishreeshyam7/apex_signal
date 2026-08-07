import { useState } from 'react';
import ForceGraph from './components/ForceGraph';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import stakeholdersData from './data/stakeholders.json';
import type { NodeData, GraphData } from './types';
import styles from './App.module.css';

const data = stakeholdersData as GraphData;

function App() {
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleNodeClick = (node: NodeData) => {
    setSelectedNode(prev => prev?.id === node.id ? null : node);
  };

  return (
    <div className={styles.app}>
      {/* Top Header */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.logo}>ApexSignal</span>
          <span className={styles.headerDivider} />
          <span className={styles.headerTitle}>Stakeholder Relationship Visualiser</span>
        </div>
        <div className={styles.clientTag}>
          <span className={styles.clientDot} />
          Shell plc
        </div>
      </header>

      {/* Toolbar */}
      <Toolbar
        filterType={filterType}
        searchQuery={searchQuery}
        onFilterChange={setFilterType}
        onSearchChange={setSearchQuery}
        totalNodes={data.nodes.length}
      />

      {/* Main content */}
      <main className={styles.main}>
        <div className={styles.graphArea}>
          <ForceGraph
            data={data}
            onNodeClick={handleNodeClick}
            selectedNode={selectedNode}
            filterType={filterType}
            searchQuery={searchQuery}
          />
          {/* Tip overlay */}
          <div className={styles.tipOverlay}>
            <span>Scroll to zoom · Drag to pan · Click node for details</span>
          </div>
        </div>

        <div className={`${styles.sidebarArea} ${selectedNode ? styles.sidebarVisible : ''}`}>
          <Sidebar
            node={selectedNode}
            links={data.links}
            onClose={() => setSelectedNode(null)}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
