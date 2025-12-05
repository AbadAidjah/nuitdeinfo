import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bot, User, Mail, Lock, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Input from '../components/Input';
import Button from '../components/Button';

const API_BASE_URL = '';

const Register: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }

    if (password.length < 6) {
      toast.error("Le mot de passe doit faire au moins 6 caractères.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
          firstName,
          lastName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'inscription");
      }

      // Save token and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        id: String(data.id),
        username: data.username,
        email: data.email,
        role: data.role
      }));

      toast.success("Compte créé avec succès !");
      navigate('/notes');
    } catch (err: any) {
      toast.error(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md mb-8"
      >
         <Link to="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Retour à la connexion
         </Link>
         <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Créer un compte
            </h2>
            <p className="mt-2 text-sm text-gray-600">
            Rejoignez SmartNotes et boostez votre productivité.
            </p>
         </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-2 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white py-8 px-4 shadow-xl shadow-indigo-100/50 sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="firstName"
                type="text"
                label="Prénom"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                icon={<User className="w-5 h-5" />}
                placeholder="Jean"
              />

              <Input
                id="lastName"
                type="text"
                label="Nom"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                icon={<User className="w-5 h-5" />}
                placeholder="Dupont"
              />
            </div>

            <Input
              id="username"
              type="text"
              label="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              icon={<User className="w-5 h-5" />}
              placeholder="jeandupont"
            />

            <Input
              id="email"
              type="email"
              label="Adresse Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon={<Mail className="w-5 h-5" />}
              placeholder="jean@exemple.com"
            />

            <div className="grid grid-cols-1 gap-5">
              <Input
                id="password"
                type="password"
                label="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                icon={<Lock className="w-5 h-5" />}
                placeholder="••••••••"
              />

              <Input
                id="confirmPassword"
                type="password"
                label="Confirmer"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                icon={<Lock className="w-5 h-5" />}
                placeholder="••••••••"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full py-3 text-base shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all" isLoading={loading}>
                S'inscrire gratuitement
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500">
            En vous inscrivant, vous acceptez nos <a href="#" className="underline hover:text-indigo-600">Conditions d'utilisation</a> et notre <a href="#" className="underline hover:text-indigo-600">Politique de confidentialité</a>.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;