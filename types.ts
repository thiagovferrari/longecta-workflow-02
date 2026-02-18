
export interface Demand {
  id: string;
  workspace_id: string;
  title: string;
  description: string;
  due_date: string;
  state: 'active' | 'completed' | 'deleted';
  created_by: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  owner?: 'thiago' | 'kalil';
}

export interface Project {
  id: string;
  title: string;
  description: string;
  date: string;
  website: string;
  image_url: string;
  status: 'active' | 'completed' | 'prospect';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type ViewType = 'active' | 'completed' | 'projects';

export interface PresenceUser {
  user_id: string;
  email: string;
  online_at: string;
}

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'candidate';
  payload: any;
  from: string;
}
