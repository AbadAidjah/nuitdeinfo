import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, Users, LogOut, FileText, Bot, Settings, User as UserIcon, Lock, Mail, Link as LinkIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import { User, UserRole } from '../types';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';

const API_BASE_URL = '';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Profile Modal State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    profileLink: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Read user from localStorage
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson) as User;
        setCurrentUser(user);
      } catch (e) {
        console.error('Failed to parse user from localStorage');
        setCurrentUser(null);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    navigate('/login');
    toast.success("Vous avez été déconnecté.");
  };

  const handleUpdateProfile = async () => {
    if (!currentUser) return;
    if (!profileForm.username || !profileForm.email) {
      toast.error("Nom d'utilisateur et email requis.");
      return;
    }
    if (profileForm.password && profileForm.password !== profileForm.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        handleLogout();
        return;
      }

      const updateData: any = {
        username: profileForm.username,
        email: profileForm.email,
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        profileLink: profileForm.profileLink
      };
      
      // Only include password if provided
      if (profileForm.password && profileForm.password.trim() !== '') {
        updateData.password = profileForm.password;
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur lors de la mise à jour' }));
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
      }

      const data = await response.json();
      
      // Update localStorage and state with all user fields
      const updatedUser: User & { firstName?: string; lastName?: string; profileLink?: string } = {
        id: String(data.id),
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        profileLink: data.profileLink,
        role: data.role as UserRole
      };
      
      // Always update token (new one is always returned)
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser as User);
      
      toast.success("Profil mis à jour avec succès !");
      setIsProfileOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la mise à jour.");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenProfile = () => {
    if (currentUser) {
      const user = currentUser as any;
      setProfileForm({
        username: currentUser.username,
        email: currentUser.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        profileLink: user.profileLink || '',
        password: '',
        confirmPassword: ''
      });
      setIsProfileOpen(true);
    }
  };

  const navItems = [
    { name: 'Mes Notes', path: '/notes', icon: <FileText className="w-5 h-5" /> },
    ...(currentUser?.role === UserRole.ADMIN 
      ? [{ name: 'Utilisateurs', path: '/users', icon: <Users className="w-5 h-5" /> }] 
      : []),
  ];

  const getDisplayName = () => {
    const user = currentUser as any;
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return currentUser?.username || '';
  };

  const getInitials = () => {
    const user = currentUser as any;
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    return currentUser?.username?.charAt(0).toUpperCase() || '?';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Bot className="w-8 h-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-800">SmartNotes</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-500">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex flex-col flex-1 h-full px-4 py-6 overflow-y-auto">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto border-t border-gray-200 pt-6">
            <div 
                className="flex items-center px-4 mb-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors group"
                onClick={handleOpenProfile}
                title="Modifier mon profil"
            >
              <div className="flex-shrink-0 relative">
                 <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                    {getInitials()}
                 </div>
                 <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <Settings className="w-3 h-3 text-gray-500" />
                 </div>
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-700 truncate">{getDisplayName()}</p>
                <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between md:hidden h-16 px-4 bg-white border-b border-gray-200">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="ml-4 text-lg font-semibold text-gray-800">SmartNotes</span>
          </div>
          {/* Mobile Profile Icon Trigger */}
           <button onClick={handleOpenProfile} className="text-gray-500 hover:text-indigo-600">
               <Settings className="w-6 h-6" />
           </button>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>

      {/* Profile Modal */}
      <Modal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        title="Mon Profil"
        footer={
            <>
                <Button variant="ghost" onClick={() => setIsProfileOpen(false)}>Annuler</Button>
                <Button onClick={handleUpdateProfile} isLoading={saving}>Enregistrer</Button>
            </>
        }
      >
        <div className="space-y-5">
            <div className="flex justify-center mb-6">
                <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-3xl font-bold shadow-inner">
                    {profileForm.firstName && profileForm.lastName 
                      ? `${profileForm.firstName.charAt(0)}${profileForm.lastName.charAt(0)}`.toUpperCase()
                      : profileForm.username.charAt(0).toUpperCase() || '?'
                    }
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Prénom"
                    icon={<UserIcon className="w-4 h-4" />}
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                    placeholder="Jean"
                />
                <Input
                    label="Nom"
                    icon={<UserIcon className="w-4 h-4" />}
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                    placeholder="Dupont"
                />
            </div>

            <Input
                label="Nom d'utilisateur"
                icon={<UserIcon className="w-4 h-4" />}
                value={profileForm.username}
                onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
            />
            
            <Input
                label="Email"
                type="email"
                icon={<Mail className="w-4 h-4" />}
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
            />

            <Input
                label="Lien de profil (optionnel)"
                icon={<LinkIcon className="w-4 h-4" />}
                value={profileForm.profileLink}
                onChange={(e) => setProfileForm({ ...profileForm, profileLink: e.target.value })}
                placeholder="https://github.com/username"
            />

            <div className="border-t border-gray-100 pt-4 mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Changer le mot de passe (optionnel)</h4>
                <div className="space-y-4">
                    <Input
                        label="Nouveau mot de passe"
                        type="password"
                        icon={<Lock className="w-4 h-4" />}
                        value={profileForm.password}
                        onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                        placeholder="••••••••"
                    />
                    <Input
                        label="Confirmer le mot de passe"
                        type="password"
                        icon={<Lock className="w-4 h-4" />}
                        value={profileForm.confirmPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                    />
                </div>
            </div>
            
             <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                <span>Rôle: <span className="font-medium text-gray-600">{currentUser?.role}</span></span>
                <span>ID: {currentUser?.id?.toString().slice(0, 8)}...</span>
             </div>

             <div className="border-t border-gray-100 pt-4 mt-4">
                <button
                    type="button"
                    onClick={() => {
                        setIsProfileOpen(false);
                        handleLogout();
                    }}
                    className="w-full flex items-center justify-center px-4 py-2 border border-red-200 text-sm font-medium rounded-lg text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Se déconnecter
                </button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default Layout;