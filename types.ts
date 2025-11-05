export interface Space {
  id: string;
  name: string;
  color: string;
}

export interface Note {
  id: string;
  title: string;
  content: string; // Will now store TipTap JSON as a string
  spaceId: string;
}

export interface Link {
  source: string;
  target: string;
  reason?: string;
}
