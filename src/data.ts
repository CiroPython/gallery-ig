// src/data.ts
export interface Post {
  id: string;
  mediaUrl: string;
  mediaType: string;
  caption?: string;
  isGated: boolean;
}
