import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Sparkles, Save, Search, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import Layout from '../components/Layout';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import { GeminiService } from '../services/geminiService';

const API_BASE_URL = '';

interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
}

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  
  // AI State
  const [isGenerating, setIsGenerating] = useState(false);

  const getToken = (): string | null => {
    return localStorage.getItem('token');
  };

  const getCurrentUser = (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  };

  const currentUser = getCurrentUser();

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredNotes(notes);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      setFilteredNotes(
        notes.filter(
          (n) =>
            n.title.toLowerCase().includes(lowerQuery) ||
            (n.content && n.content.toLowerCase().includes(lowerQuery))
        )
      );
    }
  }, [searchQuery, notes]);

  const loadNotes = async () => {
    setLoading(true);
    const token = getToken();
    
    if (!token) {
      console.log('No token found, redirecting to login');
      window.location.href = '/#/login';
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/notes/my-notes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log('401 Unauthorized, clearing session');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/#/login';
          return;
        }
        throw new Error('Failed to load notes');
      }

      const data = await response.json();
      setNotes(data || []);
    } catch (error: any) {
      console.error('Error loading notes:', error);
      // Don't redirect on network errors, just show the error
      if (error.name !== 'TypeError') {
        toast.error(error.message || 'Erreur lors du chargement des notes');
      } else {
        toast.error('Impossible de se connecter au serveur');
      }
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (note?: Note) => {
    if (note) {
      setEditingNote(note);
      setTitle(note.title);
      setContent(note.content || '');
    } else {
      setEditingNote(null);
      setTitle('');
      setContent('');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setEditingNote(null);
      setTitle('');
      setContent('');
    }, 300);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Le titre est obligatoire");
      return;
    }

    // Content is required by backend
    const noteContent = content.trim() || 'Note sans contenu';

    setSaving(true);

    try {
      let response;

      if (editingNote) {
        // Update existing note
        response = await fetch(`${API_BASE_URL}/api/notes/update/${editingNote.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ 
            title: title.trim(), 
            content: noteContent 
          }),
        });
      } else {
        // Create new note
        response = await fetch(`${API_BASE_URL}/api/notes/create/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ 
            title: title.trim(), 
            content: noteContent 
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Erreur lors de la sauvegarde');
      }

      await loadNotes();
      handleCloseModal();
      toast.success(editingNote ? "Note modifiée !" : "Note créée !");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette note ?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/notes/delete/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
          },
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la suppression');
        }

        await loadNotes();
        toast.success("Note supprimée");
      } catch (error: any) {
        toast.error(error.message || "Erreur lors de la suppression");
      }
    }
  };

  const handleGenerateAI = async () => {
    if (!title) {
      toast.error("Veuillez entrer un titre pour l'IA");
      return;
    }
    setIsGenerating(true);
    const loadingToast = toast.loading("Génération en cours avec Gemini...");
    
    try {
      const prompt = content 
        ? `Améliore cette note qui parle de : ${title}. Contenu actuel : ${content}` 
        : `Écris une note complète à propos de : ${title}`;
      const generated = await GeminiService.generateNoteContent(prompt);
      setContent(generated);
      toast.success("Contenu généré !");
    } catch (error) {
      toast.error("Erreur API Gemini");
    } finally {
      setIsGenerating(false);
      toast.dismiss(loadingToast);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mes Notes</h1>
          <p className="text-gray-500 mt-1">Organisez vos idées simplement.</p>
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          <Button onClick={() => handleOpenModal()} icon={<Plus className="w-5 h-5" />} className="whitespace-nowrap">
            Nouvelle Note
          </Button>
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100"
        >
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-50 mb-4">
            {searchQuery ? <Search className="h-8 w-8 text-indigo-400" /> : <AlertCircle className="h-8 w-8 text-indigo-400" />}
          </div>
          <h3 className="mt-2 text-lg font-semibold text-gray-900">
            {searchQuery ? "Aucun résultat" : "C'est vide ici !"}
          </h3>
          <p className="mt-1 text-gray-500">
            {searchQuery ? "Essayez d'autres mots-clés." : "Créez votre première note pour commencer."}
          </p>
        </motion.div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredNotes.map((note) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                key={note.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col group hover:shadow-lg hover:border-indigo-100 transition-all duration-300"
              >
                <div className="p-6 flex-1 cursor-pointer" onClick={() => handleOpenModal(note)}>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{note.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-4 whitespace-pre-wrap">
                    {note.content || <span className="italic opacity-50">Aucun contenu...</span>}
                  </p>
                </div>
                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center rounded-b-xl">
                  <span className="text-xs font-medium text-gray-400">
                    {note.created_at ? new Date(note.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'short'
                    }) : 'Aujourd\'hui'}
                  </span>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleOpenModal(note); }}
                      className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingNote ? 'Modifier la note' : 'Nouvelle note'}
        footer={
          <>
            <Button variant="ghost" onClick={handleCloseModal}>Annuler</Button>
            <Button onClick={handleSave} icon={<Save className="w-4 h-4" />} isLoading={saving}>Enregistrer</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input 
            placeholder="Titre de la note" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-bold border-none px-0 shadow-none focus:ring-0 placeholder:text-gray-300 text-gray-900"
            autoFocus
          />
          
          <div className="relative">
            <textarea
              className="w-full h-80 p-4 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none text-gray-700 leading-relaxed"
              placeholder="Écrivez votre note ici..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>
            
            <div className="absolute bottom-4 right-4 z-10">
              <Button 
                type="button" 
                variant="secondary" 
                size="sm" 
                className="text-xs shadow-md bg-white hover:bg-purple-50 border-purple-100 text-purple-700"
                onClick={handleGenerateAI}
                isLoading={isGenerating}
                icon={<Sparkles className="w-3 h-3 text-purple-600" />}
              >
                IA
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default Notes;