const AI_ADJUSTMENT_MAX = 10;
const AI_ADJUSTMENT_MIN = -10;

const THRESHOLDS = {
  critical: 75,
  high: 50,
  medium: 30,
  low: 0
};

function getPriorityLevel(score) {
  if (score >= THRESHOLDS.critical) return 'Critical';
  if (score >= THRESHOLDS.high) return 'High';
  if (score >= THRESHOLDS.medium) return 'Medium';
  return 'Low';
}

export async function handleAnalyzePriority(request, env) {
  const body = await request.json();
  const { clusterId, issueData } = body;
  
  if (!clusterId || !issueData || !issueData.priority?.baseScore) {
    return new Response(JSON.stringify({ error: "Missing clusterId or base priority data" }), { status: 400 });
  }

  const baseScore = issueData.priority.baseScore;
  const factors = issueData.priority.factors || [];

  // Prompt Gemini
  const prompt = `
    You are an AI Priority Engine for a Civic Issue reporting system.
    Your task is to review the deterministic civic priority and suggest a minor contextual adjustment based on safety, urgency, and public impact.

    Civic Issue Details:
    - Title: ${issueData.title || 'Unknown'}
    - Description: ${issueData.description || 'Unknown'}
    - Category: ${issueData.category || 'Unknown'}
    - AI Severity: ${issueData.aiAnalysis?.severity || 'Unknown'}
    - Report Count: ${issueData.reportCount || 1}
    - Community Confidence: ${issueData.communityConfidence?.score || 0}%
    
    Deterministic Base Score: ${baseScore}/100
    Factors:
    ${factors.map(f => `- ${f}`).join('\n')}

    Provide your recommendation in strict JSON format.
    You MUST NOT invent facts (e.g., do not claim there is a school nearby unless the description/location implies it).
    
    Schema:
    {
      "recommendation": "increase" | "maintain" | "decrease",
      "adjustment": number (between -10 and 10),
      "context": "Concise 1-2 sentence explanation of your reasoning based on public safety/urgency."
    }
  `;

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;
    
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      })
    });

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${await geminiResponse.text()}`);
    }

    const data = await geminiResponse.json();
    const rawText = data.candidates[0].content.parts[0].text;
    const aiResult = JSON.parse(rawText);

    // 1. Clamp Adjustment
    let clampedAdjustment = Number(aiResult.adjustment) || 0;
    clampedAdjustment = Math.max(AI_ADJUSTMENT_MIN, Math.min(AI_ADJUSTMENT_MAX, clampedAdjustment));

    // 2. Calculate Final Score
    const finalScore = Math.max(0, Math.min(100, baseScore + clampedAdjustment));
    const level = getPriorityLevel(finalScore);

    // 3. Update Firestore via REST API
    const authHeader = request.headers.get("Authorization");
    const token = authHeader ? authHeader.replace("Bearer ", "") : null;
    
    const projectId = env.FIREBASE_PROJECT_ID || "citizenvox-91c1a";
    const collectionName = body.isCluster ? 'issueClusters' : 'issues';
    const updateUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}/${clusterId}?updateMask.fieldPaths=priority.aiAdjustment&updateMask.fieldPaths=priority.finalScore&updateMask.fieldPaths=priority.level&updateMask.fieldPaths=priority.aiContext&updateMask.fieldPaths=priority.updatedAt`;
    
    // We only update the AI specific fields, baseScore and factors are handled by the frontend deterministic engine
    const payload = {
      fields: {
        priority: {
          mapValue: {
            fields: {
              baseScore: { integerValue: baseScore }, // Retain existing base score
              aiAdjustment: { integerValue: clampedAdjustment },
              finalScore: { integerValue: finalScore },
              level: { stringValue: level },
              aiContext: { stringValue: aiResult.context || "No context provided." },
              factors: {
                arrayValue: {
                  values: factors.map(f => ({ stringValue: f }))
                }
              },
              updatedAt: { timestampValue: new Date().toISOString() }
            }
          }
        }
      }
    };

    const patchHeaders = { 'Content-Type': 'application/json' };
    if (token) patchHeaders['Authorization'] = `Bearer ${token}`;

    const patchResponse = await fetch(updateUrl, {
      method: 'PATCH',
      headers: patchHeaders,
      body: JSON.stringify(payload)
    });

    if (!patchResponse.ok) {
      console.warn("Worker could not save AI Priority. Make sure client updates it. Error:", await patchResponse.text());
      // Even if Firestore update fails, return the result to the client so it can update it
      return new Response(JSON.stringify({ 
        success: true, 
        priority: { baseScore, aiAdjustment: clampedAdjustment, finalScore, level, aiContext: aiResult.context, factors } 
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      priority: { baseScore, aiAdjustment: clampedAdjustment, finalScore, level, aiContext: aiResult.context, factors } 
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    throw new Error("AI Priority Analysis failed: " + err.message);
  }
}
