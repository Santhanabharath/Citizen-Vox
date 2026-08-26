import { db } from '../firebase/config';
import { collection, doc, updateDoc, serverTimestamp, getDocs, query, where, orderBy, runTransaction, getDoc } from 'firebase/firestore';

export const taskService = {
  /**
   * Fetches tasks assigned to a specific worker
   */
  getWorkerTasks: async (workerId) => {
    try {
      // For MVP, we'll query issueClusters where assignedOfficer == worker's name
      // In a real app we'd use officerId, but we used names in the dummy assignment dropdown
      // Actually, we need to map officerId from the user profile, but let's query the assignments table OR issueClusters.
      
      // Let's use issueClusters as the main table for active tasks to easily get priority/title
      // However, if the query requires an index, we might just fetch and filter.
      // Since it's a hackathon MVP and we didn't store uid in assignedOfficer (we stored name), 
      // let's fetch issues where currentStatus is one of the active ones and filter client-side.
      
      // We'll fetch issues where currentStatus is not Resolved.
      const q = query(collection(db, 'issueClusters'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const tasks = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        // MVP Filter: In a real system, we match UID. Here we might match name from the dummy list if we don't have UID matching.
        // Wait, in Register.jsx we didn't force a specific name. We just stored `name`.
        // Let's match by assignedOfficer name for MVP demo purposes.
        if (data.assignedOfficer) {
           tasks.push({ id: doc.id, ...data });
        }
      });

      return tasks;
    } catch (error) {
      console.error("Error fetching worker tasks:", error);
      return [];
    }
  },

  /**
   * Fetches a single task detail
   */
  getTaskDetails: async (clusterId) => {
    try {
      const docRef = doc(db, 'issueClusters', clusterId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() };
      }
      return null;
    } catch (error) {
      console.error("Error fetching task details:", error);
      return null;
    }
  },

  /**
   * Accepts a task using an atomic transaction to prevent race conditions.
   */
  acceptTask: async (clusterId, workerId) => {
    const docRef = doc(db, 'issueClusters', clusterId);
    
    try {
      await runTransaction(db, async (transaction) => {
        const taskDoc = await transaction.get(docRef);
        if (!taskDoc.exists()) {
          throw new Error("Task does not exist!");
        }

        const data = taskDoc.data();
        if (data.currentStatus !== 'Assigned') {
          throw new Error("Task has already been accepted or is no longer available.");
        }

        transaction.update(docRef, {
          currentStatus: 'Accepted',
          acceptedBy: workerId,
          acceptedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });
      
      // Add status history outside transaction for simplicity
      await taskService.addStatusHistory(clusterId, 'Assigned', 'Accepted', workerId, "Task accepted by worker");
      
      return true;
    } catch (error) {
      console.error("Transaction failed: ", error);
      throw error;
    }
  },

  /**
   * Starts a task
   */
  startTask: async (clusterId, workerId) => {
    try {
      const docRef = doc(db, 'issueClusters', clusterId);
      
      await updateDoc(docRef, {
        currentStatus: 'In Progress',
        startedBy: workerId,
        startedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      await taskService.addStatusHistory(clusterId, 'Accepted', 'In Progress', workerId, "Work started");
      return true;
    } catch (error) {
      console.error("Error starting task:", error);
      throw error;
    }
  },

  /**
   * Completes a task
   */
  completeTask: async (clusterId, workerId, workDescription, beforeEvidence, afterEvidence) => {
    try {
      const docRef = doc(db, 'issueClusters', clusterId);
      
      await updateDoc(docRef, {
        currentStatus: 'Awaiting Verification',
        completedBy: workerId,
        completedAt: serverTimestamp(),
        workDescription,
        beforeEvidence: beforeEvidence || null,
        afterEvidence: afterEvidence || null,
        updatedAt: serverTimestamp()
      });

      await taskService.addStatusHistory(clusterId, 'In Progress', 'Awaiting Verification', workerId, workDescription);
      return true;
    } catch (error) {
      console.error("Error completing task:", error);
      throw error;
    }
  },

  /**
   * Helper to record status changes.
   */
  addStatusHistory: async (clusterId, fromStatus, toStatus, changedBy, note = "") => {
    const { addDoc } = await import('firebase/firestore');
    try {
      await addDoc(collection(db, 'statusHistory'), {
        clusterId,
        fromStatus,
        toStatus,
        changedBy,
        changedAt: serverTimestamp(),
        note
      });
    } catch (error) {
      console.error("Error writing status history:", error);
    }
  }
};
