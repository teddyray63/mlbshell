import { NextRequest, NextResponse } from 'next/server';

// Saved edges are stored in-memory (would be DB in production)
// In production, replace with Supabase or similar
const edgesStore: SavedEdge[] = [
  {
    id: 'edge-1',
    player: 'Aaron Judge',
    prop: 'Home Runs',
    line: 0.5,
    direction: 'over',
    edge: 8.2,
    confidence: 'high',
    savedAt: new Date().toISOString(),
    notes: 'Elite exit velocity vs LHP, Yankee Stadium HR factor 121',
  },
  {
    id: 'edge-2',
    player: 'Freddie Freeman',
    prop: 'Hits',
    line: 1.5,
    direction: 'over',
    edge: 6.4,
    confidence: 'high',
    savedAt: new Date().toISOString(),
    notes: 'Dodger Stadium day game, .312 avg vs RHP',
  },
  {
    id: 'edge-3',
    player: 'Corbin Burnes',
    prop: 'Strikeouts',
    line: 6.5,
    direction: 'over',
    edge: 5.7,
    confidence: 'medium',
    savedAt: new Date().toISOString(),
    notes: '11.2 K/9 this season, favorable matchup',
  },
  {
    id: 'edge-4',
    player: 'Yordan Alvarez',
    prop: 'Total Bases',
    line: 1.5,
    direction: 'over',
    edge: 7.1,
    confidence: 'high',
    savedAt: new Date().toISOString(),
    notes: 'xwOBA .420, Minute Maid HR factor 108',
  },
  {
    id: 'edge-5',
    player: 'Bryce Harper',
    prop: 'RBIs',
    line: 0.5,
    direction: 'over',
    edge: 4.1,
    confidence: 'medium',
    savedAt: new Date().toISOString(),
  },
];

interface SavedEdge {
  id: string;
  player: string;
  prop: string;
  line: number;
  direction: 'over' | 'under';
  edge: number;
  confidence: 'high' | 'medium' | 'low';
  savedAt: string;
  notes?: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const confidence = searchParams.get('confidence');
  
  let edges = [...edgesStore];
  if (confidence && confidence !== 'all') {
    edges = edges.filter((e) => e.confidence === confidence);
  }
  
  edges.sort((a, b) => b.edge - a.edge);
  
  return NextResponse.json({
    edges,
    total: edgesStore.length,
    fetchedAt: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newEdge: SavedEdge = {
      id: `edge-${Date.now()}`,
      player: body.player,
      prop: body.prop,
      line: body.line,
      direction: body.direction,
      edge: body.edge,
      confidence: body.confidence ?? 'medium',
      savedAt: new Date().toISOString(),
      notes: body.notes,
    };
    edgesStore.push(newEdge);
    return NextResponse.json({ edge: newEdge, success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  
  const idx = edgesStore.findIndex((e) => e.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Edge not found' }, { status: 404 });
  
  edgesStore.splice(idx, 1);
  return NextResponse.json({ success: true });
}
