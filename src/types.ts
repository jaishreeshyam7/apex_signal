// types.ts — Yash Garg
// Defining the data model was actually the part I found most interesting.
// The key question I kept coming back to: what does an *edge* need to carry
// for this to be genuinely useful to a risk analyst, not just visually nice?
// Landed on: type (what kind of relationship), strength (how much does it matter),
// state (where is it heading), direction (who's driving it).
// The 'state' field is the one that does the most work.
export type StakeholderType =
  | 'company'
  | 'government'
  | 'regulator'
  | 'competitor'
  | 'supplier'
  | 'ngo'
  | 'financier'
  | 'union'
  | 'customer'
  | 'partner'
  | 'individual';

export type RelationshipState = 'stable' | 'improving' | 'deteriorating';
export type RelationshipType = 'regulatory' | 'adversarial' | 'collaborative' | 'financial' | 'operational';

export interface NodeData extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: StakeholderType;
  country: string;
  description: string;
  influence: 'critical' | 'high' | 'medium' | 'low'; // how much they can affect the company
}

export interface LinkData extends d3.SimulationLinkDatum<NodeData> {
  source: string | NodeData;
  target: string | NodeData;
  type: RelationshipType;
  strength: number; // 1–10
  state: RelationshipState;
  direction: 'outbound' | 'inbound' | 'bilateral'; // who leads the relationship
  description: string;
}

export interface GraphData {
  nodes: NodeData[];
  links: LinkData[];
}
