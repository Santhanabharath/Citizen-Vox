import React, { useState, useEffect } from 'react';
import { workflowService } from '../../services/workflowService';
import { Clock } from 'lucide-react';

const StatusTimeline = ({ issue }) => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      if (!issue) return;
      setLoading(true);
      try {
        const history = await workflowService.getTimeline(issue.id);
        
        // We also want to include the initial creation event
        const events = [...history];
        
        if (issue.createdAt) {
          events.push({
            id: 'creation',
            fromStatus: null,
            toStatus: 'Submitted',
            note: 'Issue reported by citizen',
            changedAt: issue.createdAt,
            isCreation: true
          });
        }
        
        // Sort ascending by time to show timeline from top to bottom
        events.sort((a, b) => {
          const timeA = a.changedAt?.toDate ? a.changedAt.toDate().getTime() : 0;
          const timeB = b.changedAt?.toDate ? b.changedAt.toDate().getTime() : 0;
          return timeA - timeB;
        });
        
        setTimeline(events);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, [issue]);

  if (loading) return <div className="text-small text-muted" style={{ padding: '1rem' }}>Loading timeline...</div>;

  return (
    <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
      <h3 className="text-h3" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Clock size={20} /> Operational Timeline
      </h3>
      
      <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
        {/* Vertical line */}
        <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '2px', background: 'var(--border)' }}></div>
        
        {timeline.map((event, idx) => {
          const dateStr = event.changedAt?.toDate 
            ? new Date(event.changedAt.toDate()).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' }) 
            : 'Unknown time';
            
          return (
            <div key={event.id || idx} style={{ position: 'relative', marginBottom: idx === timeline.length - 1 ? 0 : '1.5rem' }}>
              {/* Dot */}
              <div style={{ 
                position: 'absolute', 
                left: '-1.5rem', 
                top: '4px', 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%', 
                background: event.isCreation ? 'var(--primary)' : 'var(--accent)',
                border: '2px solid var(--surface)'
              }}></div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                <div style={{ fontWeight: '600', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  {event.isCreation ? 'Issue Submitted' : `Status: ${event.toStatus}`}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dateStr}</div>
              </div>
              
              {event.note && (
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {event.note}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusTimeline;
