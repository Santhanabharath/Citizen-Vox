import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, PlayCircle, CheckCircle, FileText, Navigation } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { taskService } from '../../services/taskService';
import EvidenceUploader from '../../components/resolution/EvidenceUploader';

const WorkerTaskDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Completion Form State
  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [workDescription, setWorkDescription] = useState('');

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const data = await taskService.getTaskDetails(id);
        if (data) {
          setTask(data);
          if (data.beforeEvidence) setBeforeImage(data.beforeEvidence);
          if (data.afterEvidence) setAfterImage(data.afterEvidence);
          if (data.workDescription) setWorkDescription(data.workDescription);
        } else {
          setError("Task not found.");
        }
      } catch (err) {
        setError("Failed to load task details.");
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  const handleStartWork = async () => {
    setActionLoading(true);
    try {
      await taskService.startTask(id, user.uid);
      setTask(prev => ({ ...prev, status: 'in_progress' }));
    } catch (err) {
      console.error(err);
      alert("Failed to start task.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteWork = async (e) => {
    e.preventDefault();
    if (!beforeImage || !afterImage || !workDescription.trim()) {
      alert("Please provide before/after photos and a work description.");
      return;
    }

    setActionLoading(true);
    try {
      await taskService.completeTask(id, user.uid, workDescription, beforeImage, afterImage);
      setTask(prev => ({ ...prev, status: 'verification_pending' }));
    } catch (err) {
      console.error(err);
      alert("Failed to submit completion.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading task...</div>;
  if (error || !task) return <div className="p-6">{error}</div>;

  return (
    <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto', paddingBottom: '6rem' }}>
      <Link to="/worker/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
        <ArrowLeft size={16} /> Back to My Work
      </Link>

      <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <span style={{ 
              padding: '0.2rem 0.6rem', 
              borderRadius: 'var(--radius-full)', 
              fontSize: '0.7rem', 
              fontWeight: '700',
              textTransform: 'uppercase',
              background: 'var(--surface-soft)',
              color: 'var(--text-primary)'
            }}>
              {task.status}
            </span>
            <h1 className="text-h2" style={{ marginTop: '0.5rem' }}>{task.title}</h1>
          </div>
        </div>
        
        <p className="text-body" style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>
          {task.description}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', background: 'var(--surface-soft)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', color: 'var(--text-primary)' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <MapPin size={16} color="var(--text-muted)" style={{ marginTop: '0.125rem' }} />
              <div>
                <span className="text-small" style={{ display: 'block', fontWeight: 500 }}>{task.locationName || 'Location unknown'}</span>
                {task.address && <span className="text-small text-muted" style={{ display: 'block', marginTop: '0.25rem' }}>{task.address}</span>}
              </div>
            </div>
            {task.latitude && task.longitude && (
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${task.latitude},${task.longitude}`}
                target="_blank" 
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.375rem 0.75rem', background: 'var(--primary-green)', color: 'white', textDecoration: 'none', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}
              >
                <Navigation size={14} /> Navigate
              </a>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <FileText size={16} color="var(--text-muted)" />
            <span className="text-small">Priority: {task.priority?.level || 'Normal'}</span>
          </div>
        </div>
      </div>

      {/* Action Area based on status */}
      {task.status === 'assigned' || task.status === 'accepted' ? (
        <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
          <button 
            onClick={handleStartWork}
            disabled={actionLoading}
            className="btn-primary"
            style={{ width: '100%', padding: '1rem', fontSize: '1.125rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', borderRadius: 'var(--radius-md)' }}
          >
            <PlayCircle size={24} /> {actionLoading ? 'Starting...' : 'Start Work Now'}
          </button>
        </div>
      ) : task.status === 'in_progress' ? (
        <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <h2 className="text-h3" style={{ marginBottom: '1.5rem' }}>Complete Work Order</h2>
          <form onSubmit={handleCompleteWork}>
            
            <EvidenceUploader 
              label="Before Photo (Required)" 
              onUpload={setBeforeImage}
              defaultImage={beforeImage}
            />
            
            <EvidenceUploader 
              label="After Photo (Required)" 
              onUpload={setAfterImage}
              defaultImage={afterImage}
            />

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="text-body" style={{ fontWeight: '600', display: 'block', marginBottom: '0.75rem' }}>
                Work Details
              </label>
              <textarea 
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                placeholder="Describe the repairs made, materials used, etc."
                required
                style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-primary)', minHeight: '100px', resize: 'vertical' }}
              />
            </div>

            <button 
              type="submit"
              disabled={actionLoading || !beforeImage || !afterImage || !workDescription}
              className="btn-primary"
              style={{ width: '100%', padding: '1rem', fontSize: '1.125rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', borderRadius: 'var(--radius-md)' }}
            >
              <CheckCircle size={24} /> {actionLoading ? 'Submitting...' : 'Submit Completion'}
            </button>
          </form>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--success-light)', borderRadius: 'var(--radius-lg)', color: 'var(--success-dark)' }}>
          <CheckCircle size={48} style={{ margin: '0 auto 1rem' }} />
          <h3 className="text-h3">Work Submitted</h3>
          <p style={{ marginTop: '0.5rem' }}>Your completion report is awaiting verification.</p>
        </div>
      )}
    </div>
  );
};

export default WorkerTaskDetails;
