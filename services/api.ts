import * as Location from 'expo-location';

//TO DO : Update when deployed
//Dev and Production URLs
const DEV_API_URL = 'http://192.168.0.43:8000'; // Personal IP
const PROD_API_URL = 'https://your-production-url.com'; 

const API_BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

// Types matching FastAPI models
export interface Plant {
  plant_id: string;
  name: string;
  species?: string;
  goal: string;
  location?: string;
  health_status: string;
  health_score?: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface PlantCreate {
  name: string;
  species?: string;
  goal: string;
  location?: string;
}

export interface ScanResult {
  scan_id: string;
  plant_id: string;
  plant_type?: string;
  health_score: number;
  health_status: string;
  issues: string[];
  recommendations: string[];
  summary: string;
  scanned_at: string;
}

export interface ChatResponse {
  response: string;
  session_id: string;
}

export interface RecommendationResult {
  climate_summary: string;
  recommendations: PlantRecommendation[];
  general_advice: string;
  weather: {
    current_temp: number;
    humidity: number;
    temp_max: number;
    temp_min: number;
    precipitation: number;
    timezone: string;
  };
  climate_zone: string;
}

export interface PlantRecommendation {
  common_name: string;
  scientific_name: string;
  match_reason: string;
  difficulty: 'easy' | 'medium' | 'hard';
  care_tips: string[];
  time_to_harvest: string;
  goal_match: string[];
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Health Check
  async healthCheck(): Promise<{ status: string }> {
    return this.request('/health');
  }

  // Plants CRUD
  async getPlants(): Promise<Plant[]> {
    return this.request('/api/v1/plants/');
  }

  async getPlant(plantId: string): Promise<Plant> {
    return this.request(`/api/v1/plants/${plantId}`);
  }

  async createPlant(data: PlantCreate): Promise<Plant> {
    return this.request('/api/v1/plants/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deletePlant(plantId: string): Promise<void> {
    return this.request(`/api/v1/plants/${plantId}`, {
      method: 'DELETE',
    });
  }

  // Image Upload
  async getUploadUrl(plantId: string, filename: string = 'photo.jpg'): Promise<{ upload_url: string; key: string }> {
    return this.request(`/api/v1/plants/${plantId}/upload-url?filename=${filename}`, {
      method: 'POST',
    });
  }

  async uploadImageToS3(uploadUrl: string, imageUri: string): Promise<void> {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'image/jpeg',
      },
      body: blob,
    });
  }

  async confirmUpload(plantId: string, key: string): Promise<{ message: string; image_url: string }> {
    return this.request(`/api/v1/plants/${plantId}/confirm-upload?key=${encodeURIComponent(key)}`, {
      method: 'POST',
    });
  }

  // AI Scan
  async scanPlant(plantId: string): Promise<ScanResult> {
    return this.request('/api/v1/ai/scan', {
      method: 'POST',
      body: JSON.stringify({ plant_id: plantId }),
    });
  }

  // AI Chat
  async chat(message: string, sessionId: string = 'default', plantId?: string): Promise<ChatResponse> {
    return this.request('/api/v1/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        session_id: sessionId,
        plant_id: plantId,
      }),
    });
  }

  async clearChat(sessionId: string): Promise<void> {
    return this.request(`/api/v1/ai/chat/${sessionId}`, {
      method: 'DELETE',
    });
  }

  // Recommendations
  async getRecommendations(params: {
    goals: string[];
    latitude?: number;
    longitude?: number;
    space_type?: string;
    sunlight?: string;
    experience_level?: string;
  }): Promise<RecommendationResult> {
    return this.request('/api/v1/ai/recommendations', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Helper to get current location
  async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return null;
      
      const location = await Location.getCurrentPositionAsync({});
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch {
      return null;
    }
  }
}

export const api = new ApiService();