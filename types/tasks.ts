export type Priority = 'low' | 'medium' | 'high';
export type Status = 'not_started' | 'in_progress' | 'completed';

export type TaskItem = {
  id: number;
  name: string;
  list_id: number;
  description?: string;
  image?: string;
  status?: Status;
  priority?: Priority;
  is_completed?: boolean;
  due_date?: string;
  updated_at?: string;
  created_at?: string;
};
