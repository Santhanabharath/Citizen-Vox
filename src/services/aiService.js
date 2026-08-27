import { db } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';

// In a real environment, this would point to the deployed Cloudflare Worker URL
// For local development with wrangler, it typically runs on port 8787
const WORKER_URL = 'http://127.0.0.1:8787/api/analyze-issue';

export const aiService = {
  /**
   * Send issue data to the Cloudflare worker for AI analysis
   * and update Firestore with the result.
   */
  analyzeIssue: async (issueId, issueData) => {
    try {
      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          issueId,
          description: issueData.description,
          category: issueData.category,
          media: issueData.media || [],
          latitude: issueData.location?.lat || null,
          longitude: issueData.location?.lng || null
        })
      });

      if (!response.ok) {
        throw new Error('AI analysis backend failed.');
      }

      const data = await response.json();
      
      if (!data.success || !data.aiAnalysis) {
        throw new Error('Invalid response from AI backend.');
      }

      // If we reach here, we have a valid aiAnalysis block
      // Now update the issue in Firestore
      if (db) {
        const issueRef = doc(db, 'issues', issueId);
        await updateDoc(issueRef, {
          aiAnalysis: data.aiAnalysis,
          status: 'under_review' // As per requirement: move to under_review if AI completes
        });
      }

      return data.aiAnalysis;
    } catch (error) {
      console.error("AI Service Error:", error);
      throw error;
    }
  },

  /**
   * Securely asks Civic Copilot a question based on localized context data.
   */
  askCopilot: async (question, contextData, role) => {
    try {
      // Use deployed worker URL in production or local for dev
      const COPILOT_URL = WORKER_URL.replace('/analyze-issue', '/copilot');
      
      const response = await fetch(COPILOT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question,
          contextData,
          role
        })
      });

      if (!response.ok) {
        throw new Error('Copilot backend failed.');
      }

      const data = await response.json();
      
      if (!data.success || !data.answer) {
        throw new Error('Invalid response from Copilot.');
      }

      return data.answer;
    } catch (error) {
      console.error("Copilot Error:", error);
      throw error;
    }
  }
};

