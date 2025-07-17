import { ApiSession } from "@/types/types";
import { BASE_URL } from "@/constants";

async function searchSessions(date?:string,limit?:string,photographer_id?:string): Promise<ApiSession[]> {
  try {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (limit) params.append('limit', limit);
    if (photographer_id) params.append('photographer_id', photographer_id);

    const response = await fetch(`${BASE_URL}/sessions?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add any necessary auth headers
        // 'Authorization': `Bearer ${token}`
      },
    });
     if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: ApiSession[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching sessions:', error);
    throw error;
  }
} 

async function deleteSession(sessionId: string): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // Add any necessary auth headers
        // 'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
}


async function createSession(photographer_id: string,customer_name:string): Promise<ApiSession> {
  try {
    const response = await fetch(`${BASE_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any necessary auth headers
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ photographer_id,customer_name }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiSession = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
}

export { searchSessions, deleteSession, createSession };