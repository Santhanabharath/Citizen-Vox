import React, { useState, useEffect } from 'react';
import { workflowService } from '../../services/workflowService';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import { MessageSquare } from 'lucide-react';

const InternalNotes = ({ clusterId }) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchNotes = async () => {
    if (!clusterId) return;
    setLoading(true);
    try {
      const data = await workflowService.getInternalNotes(clusterId);
      setNotes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [clusterId]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setSubmitting(true);
    try {
      await workflowService.addInternalNote(clusterId, newNote, user.uid, user.department || 'Admin');
      setNewNote('');
      await fetchNotes();
    } catch (err) {
      console.error("Failed to add note", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
      <h3 className="text-h3" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <MessageSquare size={20} /> Internal Notes
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <textarea 
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add an internal note (not visible to citizens)..."
          style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', minHeight: '80px', resize: 'vertical' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="secondary" size="small" onClick={handleAddNote} disabled={submitting || !newNote.trim()}>
            {submitting ? 'Adding...' : 'Add Note'}
          </Button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
        {loading ? (
          <div className="text-small text-muted">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="text-small text-muted" style={{ fontStyle: 'italic' }}>No internal notes yet.</div>
        ) : (
          notes.map(note => (
            <div key={note.id} style={{ background: 'var(--surface-soft)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '0.875rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{note.text}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>{note.department} Dept</span>
                <span>{note.createdAt?.toDate ? new Date(note.createdAt.toDate()).toLocaleString() : 'Just now'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InternalNotes;
