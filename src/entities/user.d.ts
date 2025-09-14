export interface UserDoc {
  email: string;
  name?: string;
  role: 'buyer' | 'artisan' | 'admin';
  profileComplete?: boolean;
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    bio?: string;
    specialization?: string;
    experience?: string;
    location?: { city?: string; state?: string; pincode?: string | null };
    social?: { instagram?: string; facebook?: string; website?: string };
    portfolio?: string | null;
  };
  joinedOn?: any; // Firestore Timestamp
  updatedAt?: any; // Firestore Timestamp
  metadata?: { provider?: string; lastLogin?: any };
}
