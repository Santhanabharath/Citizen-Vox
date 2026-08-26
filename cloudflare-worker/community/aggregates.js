import { calculateConfidence } from './confidence.js';

/**
 * Helper to interact with Firestore REST API.
 */
async function fetchFirestoreDoc(projectId, collection, docId) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}`;
  const response = await fetch(url);
  if (!response.ok) return null;
  return await response.json();
}

/**
 * Calculates new aggregates and updates the cluster using the Firestore REST API.
 * Because Cloudflare Workers lack the Firebase Admin SDK, we use the REST API 
 * and rely on the client's Auth token (passed in headers) or public access if rules permit.
 */
export async function updateClusterConfidence(env, clusterId, token) {
  // 1. Fetch current cluster doc to get current aggregate counts
  // In a production app, we would use Firestore transactions or a cloud function trigger.
  const projectId = env.FIREBASE_PROJECT_ID || "citizenvox-91c1a";
  const clusterDoc = await fetchFirestoreDoc(projectId, 'issueClusters', clusterId);
  
  if (!clusterDoc) throw new Error("Cluster not found");

  // Extract fields (Firestore REST API uses type keys like integerValue, stringValue)
  const fields = clusterDoc.fields || {};
  const currentReportCount = fields.reportCount?.integerValue ? parseInt(fields.reportCount.integerValue, 10) : 0;
  const currentConfirmationCount = fields.confirmationCount?.integerValue ? parseInt(fields.confirmationCount.integerValue, 10) : 0;
  const currentEvidenceCount = fields.evidenceCount?.integerValue ? parseInt(fields.evidenceCount.integerValue, 10) : 0;
  const currentFlagCount = fields.flagCount?.integerValue ? parseInt(fields.flagCount.integerValue, 10) : 0;

  // 2. Calculate new confidence
  const confidenceData = calculateConfidence({
    reportCount: currentReportCount,
    confirmationCount: currentConfirmationCount,
    evidenceCount: currentEvidenceCount,
    flagCount: currentFlagCount
  });

  // 3. Update the cluster document with the new confidence score
  // We use the REST API PATCH method
  const updateUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/issueClusters/${clusterId}?updateMask.fieldPaths=communityConfidence`;
  
  const payload = {
    fields: {
      communityConfidence: {
        mapValue: {
          fields: {
            score: { integerValue: confidenceData.score },
            level: { stringValue: confidenceData.level },
            factors: {
              arrayValue: {
                values: confidenceData.factors.map(f => ({ stringValue: f }))
              }
            }
          }
        }
      }
    }
  };

  const headers = {
    'Content-Type': 'application/json'
  };

  // If a user token is provided, pass it for auth rules
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const patchResponse = await fetch(updateUrl, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(payload)
  });

  if (!patchResponse.ok) {
    console.error("Failed to update confidence:", await patchResponse.text());
    throw new Error("Failed to update confidence on Firestore");
  }

  return confidenceData;
}
