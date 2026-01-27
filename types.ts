
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
}

export type ViewType = 'active' | 'completed';

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
