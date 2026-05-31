// src/interfaces/IUser.ts
export interface IUser {
  id: string;              // CHAR(16) - généré par newId()
  username: string;        // VARCHAR(100) NOT NULL
  email: string;           // VARCHAR(191) NOT NULL
  phone_number: string;    // VARCHAR(30) NOT NULL
  password: string;        // VARCHAR(255) NOT NULL
  role: 'admin' | 'user';  // ENUM - DÉFAUT 'admin' (à changer en 'user')
  created_at: Date;        // DATETIME
  updated_at: Date;        // DATETIME
}

// Pour création
export interface ICreateUser {
  username: string;
  email: string;
  phone_number: string;
  password: string;
  role?: 'admin' | 'user';
}