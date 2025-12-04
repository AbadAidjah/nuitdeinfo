import React, { useState, useEffect } from 'react';
import { Trash2, Mail, Shield, User as UserIcon, Plus, Search, Edit2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import Layout from '../components/Layout';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import { StorageService } from '../services/storage';
import { User, UserRole } from '../types';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Optional on edit
  const [role, setRole] = useState<UserRole>(UserRole.USER);

  const currentUser = StorageService.getCurrentUser();

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
            u.email.toLowerCase().includes(lower)
        ));
    }
  }, [searchQuery, users]);

  const loadUsers = () => {
    setUsers(StorageService.getUsers());
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
        setEditingUser(user);
        setUsername(user.username);
        setEmail(user.email);
        setRole(user.role);
        setPassword(''); // Don't show current password
    } else {
        setEditingUser(null);
        setUsername('');
        setEmail('');
        setRole(UserRole.USER);
        setPassword('');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSaveUser = () => {
    if (!username || !email) {
        toast.error("Veuillez remplir les champs obligatoires");
        return;
    }

    try {
        const allUsers = StorageService.getUsers();

        if (editingUser) {
            // Update
            const updatedUser: User = {
                ...editingUser,
                username,
                email,
                role,
                ...(password ? { password } : {}) // Only update password if provided
            };
            StorageService.updateUser(updatedUser);
            toast.success("Utilisateur mis à jour");
        } else {
            // Create
            if (!password) {
                toast.error("Mot de passe obligatoire pour la création");
                return;
            }
            if (allUsers.find(u => u.email === email)) {
                toast.error("Cet email existe déjà");
                return;
            }

            StorageService.addUser({
                username,
                email,
                password,
                role
            });
            toast.success("Utilisateur créé");
        }
        loadUsers();
        handleCloseModal();
    } catch (e) {
        toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = (id: string) => {
    if (id === currentUser?.id) {
        toast.error("Vous ne pouvez pas supprimer votre propre compte.");
        return;
    }
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      StorageService.deleteUser(id);
      loadUsers();
      toast.success("Utilisateur supprimé");
    }
  };

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
                                        <span className={`inline-flex items-center justify-center h-12 w-12 rounded-full ${user.role === UserRole.ADMIN ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                                            <UserIcon className="h-6 w-6" />
                                        </span>
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-base font-semibold text-gray-900 truncate">{user.username}</div>
                                        <div className="flex items-center text-sm text-gray-500 mt-0.5">
                                            <Mail className="flex-shrink-0 mr-1.5 h-3.5 w-3.5" />
                                            <span className="truncate">{user.email}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                                        user.role === UserRole.ADMIN 
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
                    <Button onClick={handleSaveUser} icon={<Save className="w-4 h-4" />}>Enregistrer</Button>
                </>
            }
        >
            <div className="space-y-4">
                <Input
                    label="Nom d'utilisateur"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ex: JeanDupont"
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
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                    >
                        <option value={UserRole.USER}>Utilisateur (User)</option>
                        <option value={UserRole.ADMIN}>Administrateur (Admin)</option>
                    </select>
                </div>
            </div>
        </Modal>
    </Layout>
  );
};

export default Users;