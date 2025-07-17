import { BASE_URL } from "@/constants";
import { ApiPhoto } from "@/types/types";

const searchPhotos = async (sessionId: string): Promise<ApiPhoto[]> => {
  try {
    const response = await fetch(`${BASE_URL}/photos/?sessionid=${sessionId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch photos: ${response.status}`);
    }
    
    const apiPhotos: ApiPhoto[] = await response.json();
    
    // Convert photo paths to full URLs and add to ApiPhoto objects
    const photosWithUrls = await Promise.all(apiPhotos.map(async photo => {
      try {
        const response = await fetch(`${BASE_URL}/photos/${photo.id}/file`);
        if (!response.ok) {
          console.error(`Failed to fetch photo file for ${photo.id}:`, response.status);
          return { ...photo };
        }
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        return { ...photo, image_data: url };
      } catch (err) {
        console.error('Error fetching photo file:', err);
        return { ...photo };
      }
    }));
    
    return photosWithUrls;
  } catch (err) {
    console.error('Error fetching photos:', err);
    throw new Error('Failed to fetch photos');
  }
};


async function createPhoto(sessionId: string, files: File[]): Promise<boolean> {
  try {
    const formData = new FormData();
    // Append each file to FormData under the 'image_file' key to send as a list
    files.forEach((file) => {
      formData.append('image_file', file);
    });
    
    const response = await fetch(`${BASE_URL}/photos/upload/${sessionId}`, {
      method: 'POST',
      headers: {
        // Do not set 'Content-Type' for FormData; browser sets it automatically
        // Add any necessary auth headers
        // 'Authorization': `Bearer ${token}`
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error('Error creating photo:', error);
    throw error;
  }
}

async function savePhoto(photoid: string, file: File): Promise<boolean> {
  try {
    const formData = new FormData();
      formData.append('image_file', file);
    
    const response = await fetch(`${BASE_URL}/photos/${photoid}/edit`, {
      method: 'PUT',
      headers: {
        // Do not set 'Content-Type' for FormData; browser sets it automatically
        // Add any necessary auth headers
        // 'Authorization': `Bearer ${token}`
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error('Error saving photo:', error);
    throw error;
  }
}

async function deletePhoto(photoId: string): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}/photos/${photoId}`, {
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
    console.error('Error deleting photo:', error);
    throw error;
  }
}
export { searchPhotos, deletePhoto, createPhoto,savePhoto };