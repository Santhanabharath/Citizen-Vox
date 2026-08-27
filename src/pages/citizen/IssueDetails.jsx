import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, ShieldCheck, AlertTriangle, MessageSquare, Clock, Navigation } from 'lucide-react';
import { issueService } from '../../services/issueService';
import Button from '../../components/common/Button';

const IssueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const data = await issueService.getIssueById(id);
        setIssue(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchIssue();
  }, [id]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  if (!issue) return <div style={{ padding: '2rem', textAlign: 'center' }}>Issue not found</div>;

  const confidence = issue.confidenceScore || 85; // fallback for demo
  const priority = issue.priority?.level || 'High'; // fallback
  const isCritical = priority.toLowerCase() === 'critical';

  return (
    <div style={{ paddingBottom: '100px', maxWidth: '600px', margin: '0 auto', background: 'var(--off-white)', minHeight: '100vh' }}>
      
      {/* Header Image or Map Placeholder */}
      <div style={{ height: '200px', background: 'var(--near-black)', position: 'relative', overflow: 'hidden' }}>
        {issue.media?.[0]?.url ? (
          <img src={issue.media[0].url} alt="Issue" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(to bottom, var(--near-black), var(--dark-green))', opacity: 0.9 }}></div>
        )}
        
        <button onClick={() => navigate(-1)} style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
          <ArrowLeft size={24} />
        </button>
      </div>

      <div style={{ padding: '24px', marginTop: '-40px', position: 'relative', zIndex: 10 }}>
        
        {/* Main Title Card */}
        <div className="card-premium" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <span style={{ 
              background: isCritical ? 'var(--danger-soft)' : 'var(--warning-light)', 
              color: isCritical ? 'var(--danger-dark)' : 'var(--warning-dark)', 
              padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700 
            }}>
              {priority.toUpperCase()}
            </span>
            <span style={{ background: 'var(--surface-soft)', color: 'var(--text-secondary)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600 }}>
              {issue.status}
            </span>
          </div>
          
          <h1 className="text-h2" style={{ fontSize: '1.75rem', marginBottom: '8px', lineHeight: 1.2 }}>{issue.title}</h1>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <MapPin size={16} style={{ flexShrink: 0 }} /> 
              <span>{issue.address || issue.location?.address || 'Location unknown'}</span>
            </div>
            {(issue.latitude || issue.location?.lat) && (issue.longitude || issue.location?.lng) && (
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${issue.latitude || issue.location?.lat},${issue.longitude || issue.location?.lng}`}
                target="_blank" 
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.375rem 0.75rem', background: 'var(--primary-green)', color: 'white', textDecoration: 'none', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}
              >
                <Navigation size={14} /> Navigate
              </a>
            )}
          </div>
        </div>

        {/* Community Confidence */}
        <div className="card-premium" style={{ marginBottom: '24px', background: 'var(--near-black)', color: 'var(--white)', border: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(143,234,99,0.1)', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Community Confidence</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Very Strong Evidence</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', marginBottom: '20px' }}>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary-green)', lineHeight: 1 }}>{confidence}%</div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{issue.reportCount || 1}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Reports</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{issue.media?.length || 0}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Evidence Photos</div>
            </div>
          </div>
        </div>

        {/* Details */}
        {issue.description && (
          <div className="card-premium" style={{ marginBottom: '24px' }}>
            <h3 className="text-h4" style={{ marginBottom: '12px' }}>Description</h3>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>{issue.description}</p>
          </div>
        )}

      </div>
      
      {/* Verify Button (Mock logic for now) */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 24px 32px', background: 'var(--surface)', borderTop: '1px solid var(--border-light)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', gap: '16px' }}>
          <Button variant="outline" style={{ flex: 1 }}>Add Photo</Button>
          <Button variant="primary" style={{ flex: 2 }}>Confirm Issue</Button>
        </div>
      </div>
    </div>
  );
};

export default IssueDetails;
