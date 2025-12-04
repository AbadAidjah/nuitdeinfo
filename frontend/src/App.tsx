import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, LogOut, User } from 'lucide-react';

interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

interface User {
  username: string;
  email: string;
  name: string;
}

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [editNote, setEditNote] = useState({ title: '', content: '' });

  
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/auth/user', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        await loadNotes();
      } else {
        handleLogin();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      handleLogin();
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch('/auth/login-url');
      const { loginUrl } = await response.json();
      window.location.href = loginUrl;
    } catch (error) {
      console.error('Failed to get login URL:', error);
    }
  };

  // const handleLogout = () => {
  //   window.location.href = '/logout';
  // };

    const handleLogout = async () => {
    try {
      const response = await fetch('/auth/logout-url', {
        credentials: 'include'
      });
      const { logoutUrl } = await response.json();
      window.location.href = logoutUrl;
    } catch (error) {
      console.error('Failed to get logout URL:', error);
      // Fallback to direct logout endpoint
      window.location.href = '/logout';
    }
  };

  const loadNotes = async () => {
    try {
      const response = await fetch('/api/notes/my-notes', {
        credentials: 'include'
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
      const response = await fetch('/api/notes/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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
      const response = await fetch(`/api/notes/update/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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
      const response = await fetch(`/api/notes/delete/${id}`, {
        method: 'DELETE',
        credentials: 'include'
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Notes App</h1>
          <p className="text-gray-600 mb-6">Please log in to access your notes</p>
          <button
            onClick={handleLogin}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            Login with Keycloak
          </button>
        </div>
      </div>
    );
  }

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