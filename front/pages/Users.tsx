import React, { useState, useEffect } from 'react';
import { Trash2, Mail, Shield, User as UserIcon, Plus, Search, Edit2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import Layout from '../components/Layout';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';

const API_BASE_URL = '';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'USER';
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'USER'>('USER');

  const getToken = (): string | null => {
    return localStorage.getItem('token');
  };

  const getCurrentUser = (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  };

  const currentUser = getCurrentUser();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredUsers(users);
    } else {
      const lower = searchQuery.toLowerCase();
      setFilteredUsers(users.filter(u => 
        u.username.toLowerCase().includes(lower) || 
        u.email.toLowerCase().includes(lower) ||
        u.firstName?.toLowerCase().includes(lower) ||
        u.lastName?.toLowerCase().includes(lower)
      ));
    }
  }, [searchQuery, users]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/#/login';
          return;
        }
        if (response.status === 403) {
          toast.error("Accès refusé. Vous n'êtes pas administrateur.");
          return;
        }
        throw new Error('Failed to load users');
      }

      const data = await response.json();
      setUsers(data || []);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des utilisateurs');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setUsername(user.username);
      setEmail(user.email);
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setRole(user.role);
      setPassword('');
    } else {
      setEditingUser(null);
      setUsername('');
      setEmail('');
      setFirstName('');
      setLastName('');
      setRole('USER');
      setPassword('');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setEditingUser(null);
      setUsername('');
      setEmail('');
      setFirstName('');
      setLastName('');
      setPassword('');
      setRole('USER');
    }, 300);
  };

  const handleSaveUser = async () => {
    if (!username || !email) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    setSaving(true);

    try {
      if (editingUser) {
        // Update existing user
        const updateData: any = {
          username,
          email,
          firstName,
          lastName,
          role,
        };
        
        // Only include password if provided
        if (password.trim()) {
          updateData.password = password;
        }

        const response = await fetch(`${API_BASE_URL}/api/admin/users/${editingUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
          },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(errorData || 'Erreur lors de la mise à jour');
        }

        toast.success("Utilisateur mis à jour");
      } else {
        // Create new user
        if (!password) {
          toast.error("Mot de passe obligatoire pour la création");
          setSaving(false);
          return;
        }

        if (!firstName || !lastName) {
          toast.error("Prénom et nom sont obligatoires");
          setSaving(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            username,
            email,
            password,
            firstName,
            lastName,
            role,
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(errorData || 'Erreur lors de la création');
        }

        toast.success("Utilisateur créé");
      }

      await loadUsers();
      handleCloseModal();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (id === currentUser?.id) {
      toast.error("Vous ne pouvez pas supprimer votre propre compte.");
      return;
    }

    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(errorData || 'Erreur lors de la suppression');
        }

        await loadUsers();
        toast.success("Utilisateur supprimé");
      } catch (error: any) {
        toast.error(error.message || "Erreur lors de la suppression");
      }
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
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Utilisateurs</h1>
          <p className="text-gray-500 mt-1">Gérez les accès et les rôles.</p>
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          <Button onClick={() => handleOpenModal()} icon={<Plus className="w-5 h-5" />}>
            Ajouter
          </Button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200">
        <ul className="divide-y divide-gray-100">
          <AnimatePresence>
            {filteredUsers.map((user) => (
              <motion.li 
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                key={user.id} 
                className="p-6 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0 gap-4">
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center justify-center h-12 w-12 rounded-full ${user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                        <UserIcon className="h-6 w-6" />
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-base font-semibold text-gray-900 truncate">
                        {user.firstName} {user.lastName}
                        <span className="text-gray-400 font-normal ml-2">@{user.username}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-0.5">
                        <Mail className="flex-shrink-0 mr-1.5 h-3.5 w-3.5" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                      user.role === 'ADMIN' 
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                        : 'bg-green-50 text-green-700 border-green-200'
                    }`}>
                      <Shield className="w-3 h-3 mr-1" />
                      {user.role}
                    </span>
                    
                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={() => handleOpenModal(user)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                        title="Modifier"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      
                      {user.id !== currentUser?.id && (
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
          {filteredUsers.length === 0 && (
            <li className="p-8 text-center text-gray-500">Aucun utilisateur trouvé.</li>
          )}
        </ul>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
        footer={
          <>
            <Button variant="ghost" onClick={handleCloseModal}>Annuler</Button>
            <Button onClick={handleSaveUser} icon={<Save className="w-4 h-4" />} isLoading={saving}>Enregistrer</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Prénom"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Jean"
            />
            <Input
              label="Nom"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Dupont"
            />
          </div>

          <Input
            label="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="jeandupont"
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jean@example.com"
          />
          
          <Input
            label={editingUser ? "Nouveau mot de passe (laisser vide pour conserver)" : "Mot de passe"}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="******"
          />

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'ADMIN' | 'USER')}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
            >
              <option value="USER">Utilisateur (User)</option>
              <option value="ADMIN">Administrateur (Admin)</option>
            </select>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default Users;