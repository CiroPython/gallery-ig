// src/data.ts
export interface Post {
  thumbnailUrl: string;
  id: string;
  mediaUrl: string;
  mediaType: string;
  caption?: string;
  isGated: boolean;
  description:string;
  title:string;
  likesCount:string;
}
