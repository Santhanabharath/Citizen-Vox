import React, { useState, useEffect } from 'react';
import { intelligenceService } from '../../services/intelligenceService';
import CivicHeatmap from '../../components/intelligence/CivicHeatmap';
import IntelligenceFilters from '../../components/intelligence/IntelligenceFilters';
import HotspotCard from '../../components/intelligence/HotspotCard';
import RecurrenceTimeline from '../../components/intelligence/RecurrenceTimeline';
import TrendChart from '../../components/intelligence/TrendChart';
import AIInsightCard from '../../components/intelligence/AIInsightCard';

const CivicIntelligence = () => {
  const [timeFilter, setTimeFilter] = useState(30); // days
  const [loading, setLoading] = useState(true);
  
  const [metrics, setMetrics] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [recurrence, setRecurrence] = useState([]);
  
  const [aiInsight, setAiInsight] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  // For Drilldown
  const [selectedHotspot, setSelectedHotspot] = useState(null);

  useEffect(() => {
    fetchIntelligence();
  }, [timeFilter]);

  const fetchIntelligence = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeFilter);
      
      const clusters = await intelligenceService.getClustersByDateRange(startDate, endDate);
      
      const newMetrics = intelligenceService.calculateMetrics(clusters);
      const newHotspots = intelligenceService.calculateHotspots(clusters);
      const newRecurrence = intelligenceService.calculateRecurrence(clusters);

      setMetrics(newMetrics);
      setHotspots(newHotspots);
      setRecurrence(newRecurrence);
      
      // Reset selections and AI
      setSelectedHotspot(null);
      setAiInsight(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsight = async () => {
    if (!metrics || hotspots.length === 0) {
      setAiError("Not enough civic data yet.");
      return;
    }

    setAiLoading(true);
    setAiError(null);

    try {
      const summaryPayload = {
        totalIssues: metrics.totalIssues,
        criticalIssues: metrics.criticalIssues,
        resolutionRate: metrics.resolutionRate,
        topCategories: Object.entries(metrics.categories).sort((a,b)=>b[1]-a[1]).slice(0,3).map(c => c[0]),
        totalHotspots: hotspots.length,
        criticalHotspots: hotspots.filter(h => h.level === 'Critical Hotspot').length,
        persistentProblems: recurrence.filter(r => r.level === 'Persistent Problem').length
      };

      const workerUrl = import.meta.env.VITE_WORKER_URL;
      const res = await fetch(`${workerUrl}/api/analyze-intelligence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics: summaryPayload })
      });

      if (!res.ok) throw new Error("AI Service Unavailable");
      
      const data = await res.json();
      setAiInsight(data.insight);
    } catch (err) {
      console.warn("AI Service unavailable, falling back to basic mock insight:", err);
      // Fallback to mock data if the cloudflare worker is not running
      setAiInsight({
        summary: "Based on local metrics, the system detects a steady volume of active issues. Drainage and road infrastructure appear to be the primary concern areas.",
        observations: [
          `Total active issues are at ${metrics.totalIssues}`,
          `${metrics.criticalIssues} issues are marked as critical priority.`,
          "Immediate attention is required in the dense hotspots to prevent escalation."
        ],
        limitations: [
          "Live AI processing is currently offline. This is a fallback local summary.",
          "Network connectivity to the intelligence edge-worker failed."
        ]
      });
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading Civic Intelligence...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div>
        <h1 className="text-h2" style={{ marginBottom: '0.5rem' }}>Civic Intelligence</h1>
        <p className="text-muted">Analyze patterns and concentrations of civic issues.</p>
      </div>

      <IntelligenceFilters timeFilter={timeFilter} setTimeFilter={setTimeFilter} />

      {/* Top Metrics Row */}
      {metrics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'var(--surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Active Issues</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{metrics.totalIssues}</div>
          </div>
          <div style={{ background: 'var(--surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Critical Issues</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger)' }}>{metrics.criticalIssues}</div>
          </div>
          <div style={{ background: 'var(--surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Resolution Rate</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              {metrics.resolutionRate === null ? 'Not enough data' : `${Math.round(metrics.resolutionRate)}%`}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Left Column: Map & Recurrence */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <h3 className="text-h3" style={{ marginBottom: '1.5rem' }}>Civic Concentration</h3>
            <CivicHeatmap hotspots={hotspots} />
          </div>

          <div>
            <h3 className="text-h3" style={{ marginBottom: '1rem' }}>Persistent Problems</h3>
            {recurrence.length === 0 ? (
              <div style={{ padding: '2rem', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)' }}>
                No recurring problems detected in this period.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recurrence.slice(0, 3).map(group => (
                  <RecurrenceTimeline key={group.id} recurrenceGroup={group} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Hotspots & AI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <AIInsightCard 
            insight={aiInsight} 
            loading={aiLoading} 
            error={aiError}
            onGenerate={generateAIInsight} 
          />

          <TrendChart categories={metrics?.categories} />

          <div>
            <h3 className="text-h3" style={{ marginBottom: '1rem' }}>Emerging Hotspots</h3>
            {hotspots.length === 0 ? (
               <div style={{ padding: '2rem', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)' }}>
                 No significant hotspots detected.
               </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {hotspots.slice(0, 4).map(hotspot => (
                  <HotspotCard 
                    key={hotspot.id} 
                    hotspot={hotspot} 
                    onClick={() => setSelectedHotspot(hotspot)} 
                  />
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default CivicIntelligence;
