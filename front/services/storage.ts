import { Note, User, UserRole } from '../types';

// Keys for local storage
const USERS_KEY = 'app_users';
const NOTES_KEY = 'app_notes';
const CURRENT_USER_KEY = 'app_current_user';

// Initialize with some dummy data if empty
const initializeStorage = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    const adminUser: User = {
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      role: UserRole.ADMIN,
      password: 'password123'
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([adminUser]));
  }
  if (!localStorage.getItem(NOTES_KEY)) {
    localStorage.setItem(NOTES_KEY, JSON.stringify([]));
  }
};

initializeStorage();

export const StorageService = {
  // --- Auth & User Management ---

  getUsers: (): User[] => {
    const usersStr = localStorage.getItem(USERS_KEY);
    return usersStr ? JSON.parse(usersStr) : [];
  },

  addUser: (user: Omit<User, 'id'>): User => {
    const users = StorageService.getUsers();
    const newUser: User = { ...user, id: crypto.randomUUID() };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return newUser;
  },

  updateUser: (updatedUser: User): void => {
    const users = StorageService.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      
      // Update session if it is the current user
      const currentUser = StorageService.getCurrentUser();
      if (currentUser && currentUser.id === updatedUser.id) {
        const { password, ...safeUser } = updatedUser;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
      }
    }
  },

  deleteUser: (id: string): void => {
    const users = StorageService.getUsers();
    const filtered = users.filter(u => u.id !== id);
    localStorage.setItem(USERS_KEY, JSON.stringify(filtered));
  },

  login: (email: string, password: string): User | null => {
    const users = StorageService.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      const { password, ...safeUser } = user;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
      return safeUser as User;
    }
    return null;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  // --- Notes Management ---

  getNotes: (): Note[] => {
    const notesStr = localStorage.getItem(NOTES_KEY);
    return notesStr ? JSON.parse(notesStr) : [];
  },

  saveNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Note => {
    const notes = StorageService.getNotes();
    const now = new Date().toISOString();
    
    if (note.id) {
      // Update
      const index = notes.findIndex(n => n.id === note.id);
      if (index !== -1) {
        const updatedNote = { ...notes[index], ...note, updatedAt: now };
        notes[index] = updatedNote;
        localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
        return updatedNote;
      }
    }
    
    // Create
    const newNote: Note = {
      id: crypto.randomUUID(),
      userId: note.userId,
      title: note.title,
      content: note.content,
      createdAt: now,
      updatedAt: now
    };
    notes.push(newNote);
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    return newNote;
  },

  deleteNote: (id: string): void => {
    const notes = StorageService.getNotes();
    const filtered = notes.filter(n => n.id !== id);
    localStorage.setItem(NOTES_KEY, JSON.stringify(filtered));
  }
};