export interface Album {
  _id: string;
  title: string;
  artist: string;
  imageUrl: string;
  releaseYear: number;
  songs: Song[];
}
export interface Song {
  _id: string;
  title: string;
  artist: string;
  albumId: string | null;
  duration: number;
  audioUrl: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Stats {
  totalSongs: number;
  totalAlbums: number;
  totalArtists: number;
  totalUsers: number;
}

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  clerkId: string;
  fullName: string;
  imageUrl: string;
}
