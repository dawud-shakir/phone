export interface DogPhoto {
  id: string;
  imageUrl: string;
  likes: number;
  dislikes: number;
  uploadedAt: string;
}

export type VoteType = 'like' | 'dislike';
