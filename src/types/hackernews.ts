export interface Comment {
  id: number;
  by: string;
  text: string;
  time: number;
  kids?: number[];
  replies?: Comment[];
  deleted?: boolean;
  dead?: boolean;
}

export interface Story {
  id: number;
  title: string;
  by: string;
  time: number;
  text?: string;
  url?: string;
  score: number;
  descendants: number;
  kids?: number[];
} 