import React, { useEffect, useState } from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';

type Memory = {
  id: string;
  service: string;
  type: string;
  content: string;
  owner: string;
  timestamp: string;
  status: string;
};

export const DecisionsCard = () => {
  const { entity } = useEntity();
  const serviceName = entity.metadata.name;
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`http://localhost:8001/api/memories?service=${serviceName}`)
      .then(res => res.json())
      .then(data => {
        setMemories(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [serviceName]);

  const cardStyle: React.CSSProperties = {
    padding: '16px',
    background: '#1e1e2e',
    borderRadius: '8px',
    marginBottom: '16px',
  };

  const headerStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#7df3e1',
    marginBottom: '16px',
  };

  const memoryStyle: React.CSSProperties = {
    background: '#2a2a3e',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '10px',
    borderLeft: '3px solid #7df3e1',
  };

  const typeStyle: React.CSSProperties = {
    fontSize: '11px',
    textTransform: 'uppercase',
    color: '#7df3e1',
    fontWeight: 'bold',
    marginBottom: '4px',
  };

  const contentStyle: React.CSSProperties = {
    color: '#e0e0e0',
    fontSize: '14px',
    lineHeight: '1.5',
  };

  const metaStyle: React.CSSProperties = {
    fontSize: '11px',
    color: '#888',
    marginTop: '6px',
  };

  if (loading) return <div style={cardStyle}><p style={{ color: '#888' }}>Loading decisions...</p></div>;
  if (error) return <div style={cardStyle}><p style={{ color: '#ff6b6b' }}>Error: {error}</p></div>;
  if (memories.length === 0) return <div style={cardStyle}><p style={{ color: '#888' }}>No decisions recorded for {serviceName} yet.</p></div>;

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>🧠 Decision Memory ({memories.length})</div>
      {memories.map(m => (
        <div key={m.id} style={memoryStyle}>
          <div style={typeStyle}>{m.type}</div>
          <div style={contentStyle}>{m.content}</div>
          <div style={metaStyle}>
            {m.owner} · {new Date(m.timestamp).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
};
