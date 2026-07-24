export type WritingGroup = {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
};

export type WritingArea = {
  id: string;
  groupId: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
};

export type WritingPost = {
  id: string;
  areaId: string;
  title: string;
  slug: string;
  excerpt: string;
  rating?: number;
  ratingBreakdown?: {
    story: number;
    direction: number;
    acting: number;
    cinematography: number;
    musicAndSound: number;
  };
  body: string;
  publishedAt: string;
};

export type WritingComment = {
  id: string;
  postId: string;
  name: string;
  comment: string;
  createdAt: string;
  likes: number;
  dislikes: number;
  viewerReaction: 'like' | 'dislike' | null;
};

export type WritingIndex = {
  groups: WritingGroup[];
  areas: WritingArea[];
  posts: WritingPost[];
  configured: boolean;
};
