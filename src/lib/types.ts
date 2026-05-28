export type Break = { start: number; end?: number };

export type Session = {
  id: string;
  date: string;
  clockIn: number;
  clockOut?: number;
  breaks: Break[];
};

export type Status = 'IDLE' | 'WORKING' | 'ON_BREAK';

export type AppState = {
  status: Status;
  activeSession: Session | null;
};
