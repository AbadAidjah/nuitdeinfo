import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bot, User, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Input from '../components/Input';
import Button from '../components/Button';

const API_BASE_URL = '';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Identifiants incorrects');
      }

      // Save token and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        id: String(data.id),
        username: data.username,
        email: data.email,
        role: data.role
      }));

      toast.success(`Bon retour, ${data.firstName || data.username} !`);
      
      // Navigate to notes immediately
      navigate('/notes', { replace: true });
      
    } catch (err: any) {
      toast.error(err.message || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setUsername('testuser');
    setPassword('password123');
    toast.success('Identifiants de démo remplis !');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8"
      >
        <div className="mx-auto h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
          <Bot className="w-10 h-10 text-white" />
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">
          SmartNotes
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Gérez vos idées intelligemment avec l'IA.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white py-8 px-4 shadow-xl shadow-indigo-100/50 sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              id="username"
              type="text"
              label="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              icon={<User className="w-5 h-5" />}
              placeholder="votre_nom_utilisateur"
            />

            <div>
              <Input
                id="password"
                type="password"
                label="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                icon={<Lock className="w-5 h-5" />}
                placeholder="••••••••"
              />
              <div className="flex items-center justify-end mt-1">
                <div className="text-sm">
                  <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                    Mot de passe oublié ?
                  </a>
                </div>
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full py-3 text-base shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all" isLoading={loading}>
                Se connecter <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  Pas encore de compte ?
                </span>
              </div>
            </div>
            
            <div className="mt-6">
              <Link to="/register">
                <Button variant="secondary" className="w-full">
                  Créer un compte gratuitement
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Demo Account Widget */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer group"
            onClick={fillDemoAccount}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                  <CheckCircle2 className="w-5 h-5 text-indigo-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Compte de démonstration</p>
                  <p className="text-xs text-gray-500">Cliquez pour remplir automatiquement</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </motion.div>
      
      <p className="mt-8 text-center text-xs text-gray-400">
        &copy; 2024 SmartNotes Manager. Tous droits réservés.
      </p>
    </div>
  );
};

export default Login;