import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, LogOut, User, Settings } from 'lucide-react';

const API_BASE = 'http://localhost:8081';

interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

interface UserData {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthResponse {
  token: string;
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [editNote, setEditNote] = useState({ title: '', content: '' });
  
  // Auth state
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [showProfile, setShowProfile] = useState(false);
  const [authForm, setAuthForm] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    currentPassword: '',
    newPassword: ''
  });
  const [error, setError] = useState('');

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  });

  useEffect(() => {
    if (token) {
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        await loadNotes();
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      handleLogout();
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: authForm.username,
          password: authForm.password
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        const authData = data as AuthResponse;
        localStorage.setItem('token', authData.token);
        setToken(authData.token);
        setUser({
          id: authData.id,
          username: authData.username,
          email: authData.email,
          firstName: authData.firstName,
          lastName: authData.lastName
        });
        setAuthForm({ username: '', email: '', password: '', firstName: '', lastName: '' });
        await loadNotes();
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('Login failed. Please try again.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });

      const data = await response.json();
      
      if (response.ok) {
        const authData = data as AuthResponse;
        localStorage.setItem('token', authData.token);
        setToken(authData.token);
        setUser({
          id: authData.id,
          username: authData.username,
          email: authData.email,
          firstName: authData.firstName,
          lastName: authData.lastName
        });
        setAuthForm({ username: '', email: '', password: '', firstName: '', lastName: '' });
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      setError('Registration failed. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setNotes([]);
  };

  const openProfile = () => {
    if (user) {
      setProfileForm({
        username: user.username,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        currentPassword: '',
        newPassword: ''
      });
      setShowProfile(true);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileForm)
      });

      const data = await response.json();
      
      if (response.ok) {
        const authData = data as AuthResponse;
        localStorage.setItem('token', authData.token);
        setToken(authData.token);
        setUser({
          id: authData.id,
          username: authData.username,
          email: authData.email,
          firstName: authData.firstName,
          lastName: authData.lastName
        });
        setShowProfile(false);
        setProfileForm({ ...profileForm, currentPassword: '', newPassword: '' });
      } else {
        setError(data.error || 'Update failed');
      }
    } catch (error) {
      console.error('Update failed:', error);
      setError('Update failed. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        handleLogout();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      setError('Failed to delete account. Please try again.');
    }
  };

  const loadNotes = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/notes/my-notes`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const notesData = await response.json();
        setNotes(notesData);
      } else {
        console.error('Failed to load notes');
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const createNote = async () => {
    if (!newNote.title.trim() && !newNote.content.trim()) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/notes/create/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: newNote.title.trim() || 'Untitled',
          content: newNote.content.trim()
        })
      });

      if (response.ok) {
        const createdNote = await response.json();
        setNotes([createdNote, ...notes]);
        setNewNote({ title: '', content: '' });
        setIsCreating(false);
      } else {
        const error = await response.text();
        alert('Failed to create note: ' + error);
      }
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Failed to create note');
    }
  };

  const saveEdit = async () => {
    if (!editingId) return;

    try {
      const response = await fetch(`${API_BASE}/api/notes/update/${editingId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: editNote.title.trim() || 'Untitled',
          content: editNote.content.trim()
        })
      });

      if (response.ok) {
        const updatedNote = await response.json();
        setNotes(notes.map(note => 
          note.id === editingId ? updatedNote : note
        ));
        setEditingId(null);
        setEditNote({ title: '', content: '' });
      } else {
        const error = await response.text();
        alert('Failed to update note: ' + error);
      }
    } catch (error) {
      console.error('Error updating note:', error);
      alert('Failed to update note');
    }
  };

  const deleteNote = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/notes/delete/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        setNotes(notes.filter(note => note.id !== id));
      } else {
        const error = await response.text();
        alert('Failed to delete note: ' + error);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note');
    }
  };

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setEditNote({ title: note.title, content: note.content });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditNote({ title: '', content: '' });
  };

  const cancelCreate = () => {
    setIsCreating(false);
    setNewNote({ title: '', content: '' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Profile Modal
  if (showProfile && user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Profile</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleUpdateProfile}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
              <input
                type="text"
                value={profileForm.username}
                onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">First Name</label>
                <input
                  type="text"
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Last Name</label>
                <input
                  type="text"
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <hr className="my-4" />
            <p className="text-sm text-gray-600 mb-4">Change Password (leave blank to keep current)</p>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Current Password</label>
              <input
                type="password"
                value={profileForm.currentPassword}
                onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">New Password</label>
              <input
                type="password"
                value={profileForm.newPassword}
                onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-2 mb-4">
              <button
                type="submit"
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => { setShowProfile(false); setError(''); }}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
            
            <button
              type="button"
              onClick={handleDeleteAccount}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg"
            >
              Delete Account
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Auth Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {authView === 'login' ? 'Login' : 'Register'}
          </h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={authView === 'login' ? handleLogin : handleRegister}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
              <input
                type="text"
                value={authForm.username}
                onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            {authView === 'register' && (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">First Name</label>
                    <input
                      type="text"
                      value={authForm.firstName}
                      onChange={(e) => setAuthForm({ ...authForm, firstName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Last Name</label>
                    <input
                      type="text"
                      value={authForm.lastName}
                      onChange={(e) => setAuthForm({ ...authForm, lastName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </>
            )}
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
              <input
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg mb-4"
            >
              {authView === 'login' ? 'Login' : 'Register'}
            </button>
          </form>
          
          <p className="text-center text-gray-600">
            {authView === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => { setAuthView('register'); setError(''); }}
                  className="text-blue-500 hover:underline"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => { setAuthView('login'); setError(''); }}
                  className="text-blue-500 hover:underline"
                >
                  Login
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    );
  }

  // Main App
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Notes</h1>
            <div className="flex items-center gap-2 text-gray-600 mt-1">
              <User size={16} />
              <span>Welcome, {user.username}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {!isCreating && (
              <button
                onClick={() => setIsCreating(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus size={20} />
                Add Note
              </button>
            )}
            <button
              onClick={openProfile}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Settings size={20} />
              Profile
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>

        {isCreating && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <input
              type="text"
              placeholder="Note title..."
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              className="w-full text-xl font-semibold border-none outline-none mb-4 placeholder-gray-400"
            />
            <textarea
              placeholder="Write your note here..."
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              className="w-full h-32 border-none outline-none resize-none placeholder-gray-400"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={createNote}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <Save size={16} />
                Save
              </button>
              <button
                onClick={cancelCreate}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </div>
        )}

        {notes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No notes yet. Create your first note!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="bg-white rounded-lg shadow-md p-6">
                {editingId === note.id ? (
                  <>
                    <input
                      type="text"
                      value={editNote.title}
                      onChange={(e) => setEditNote({ ...editNote, title: e.target.value })}
                      className="w-full text-xl font-semibold border-none outline-none mb-4"
                    />
                    <textarea
                      value={editNote.content}
                      onChange={(e) => setEditNote({ ...editNote, content: e.target.value })}
                      className="w-full h-32 border-none outline-none resize-none"
                    />
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={saveEdit}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center gap-1"
                      >
                        <Save size={14} />
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded flex items-center gap-1"
                      >
                        <X size={14} />
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-xl font-semibold text-gray-800">{note.title}</h2>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(note)}
                          className="text-blue-500 hover:text-blue-700 p-1"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 whitespace-pre-wrap mb-3">{note.content}</p>
                    <p className="text-sm text-gray-400">
                      Created: {new Date(note.created_at).toLocaleDateString()} at {new Date(note.created_at).toLocaleTimeString()}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;