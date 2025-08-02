import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, User, ArrowLeft } from 'lucide-react';

const LoginScreen = () => {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'register', 'forgot', 'reset'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    token: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  // Get reset token from URL if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      setCurrentView('reset');
      setFormData(prev => ({ ...prev, token }));
    }
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let endpoint, payload;

      switch (currentView) {
        case 'login':
          endpoint = '/api/Auth/login';
          payload = { email: formData.email, password: formData.password };
          break;
        case 'register':
          endpoint = '/api/auth/register';
          payload = { name: formData.name, email: formData.email, password: formData.password };
          break;
        case 'forgot':
          endpoint = '/api/auth/forgot-password';
          payload = { email: formData.email };
          break;
        case 'reset':
          if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem');
            setLoading(false);
            return;
          }
          if (formData.password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            setLoading(false);
            return;
          }
          endpoint = '/api/auth/reset-password';
          payload = { token: formData.token, password: formData.password };
          break;
        default:
          setLoading(false);
          return;
      }

      const response = await fetch(`https://localhost:44396${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        if (currentView === 'login' || currentView === 'register') {
          console.log('Autenticação bem-sucedida:', data);
          setSuccess(currentView === 'login' ? 'Login realizado com sucesso!' : 'Usuário registrado com sucesso!');
          
          // Simular redirecionamento para dashboard
          setTimeout(() => {
            alert('Redirecionando para o dashboard...');
          }, 1500);
        } else if (currentView === 'forgot') {
          setSuccess('Email de recuperação enviado! Verifique sua caixa de entrada e spam.');
          setFormData({ email: '', password: '', confirmPassword: '', name: '', token: '' });
        } else if (currentView === 'reset') {
          setSuccess('Senha alterada com sucesso! Você pode fazer login agora.');
          setFormData({ email: '', password: '', confirmPassword: '', name: '', token: '' });
          setTimeout(() => {
            setCurrentView('login');
            setSuccess('');
          }, 2000);
        }
      } else {
        setError(data.message || 'Erro ao processar solicitação');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor. Verifique se a API está rodando.');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ email: '', password: '', confirmPassword: '', name: '', token: formData.token || '' });
    setError('');
    setSuccess('');
  };

  const switchView = (view) => {
    setCurrentView(view);
    resetForm();
  };

  const getTitle = () => {
    switch (currentView) {
      case 'login': return 'Bem-vindo de Volta';
      case 'register': return 'Criar Nova Conta';
      case 'forgot': return 'Recuperar Senha';
      case 'reset': return 'Redefinir Senha';
      default: return 'Bem-vindo';
    }
  };

  const getSubtitle = () => {
    switch (currentView) {
      case 'login': return 'Entre com suas credenciais para acessar sua conta';
      case 'register': return 'Preencha os dados abaixo para criar sua conta';
      case 'forgot': return 'Digite seu email para receber o link de recuperação';
      case 'reset': return 'Digite sua nova senha nos campos abaixo';
      default: return 'Faça login em sua conta';
    }
  };

  const getButtonText = () => {
    switch (currentView) {
      case 'login': return 'Entrar na Conta';
      case 'register': return 'Criar Conta';
      case 'forgot': return 'Enviar Link de Recuperação';
      case 'reset': return 'Redefinir Senha';
      default: return 'Entrar';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 shadow-2xl">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            {getTitle()}
          </h1>
          <p className="text-white/80 text-lg leading-relaxed">
            {getSubtitle()}
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
          <div className="space-y-6">
            {/* Back Button for forgot/reset */}
            {(currentView === 'forgot' || currentView === 'reset') && (
              <button
                onClick={() => switchView('login')}
                className="flex items-center text-white/70 hover:text-white transition-colors text-sm mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao login
              </button>
            )}

            {/* Name Field (only for register) */}
            {currentView === 'register' && (
              <div className="space-y-3">
                <label className="text-white text-sm font-semibold tracking-wide">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/30 rounded-xl px-12 py-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                    placeholder="Digite seu nome completo"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email Field (for login, register, forgot) */}
            {currentView !== 'reset' && (
              <div className="space-y-3">
                <label className="text-white text-sm font-semibold tracking-wide">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/30 rounded-xl px-12 py-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                    placeholder="Digite seu email"
                    required
                  />
                </div>
              </div>
            )}

            {/* Password Field (for login, register, reset) */}
            {currentView !== 'forgot' && (
              <div className="space-y-3">
                <label className="text-white text-sm font-semibold tracking-wide">
                  {currentView === 'reset' ? 'Nova Senha' : 'Senha'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/30 rounded-xl px-12 pr-14 py-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                    placeholder={currentView === 'reset' ? 'Digite sua nova senha' : 'Digite sua senha'}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {currentView !== 'login' && (
                  <p className="text-white/60 text-xs">Mínimo de 6 caracteres</p>
                )}
              </div>
            )}

            {/* Confirm Password Field (only for reset) */}
            {currentView === 'reset' && (
              <div className="space-y-3">
                <label className="text-white text-sm font-semibold tracking-wide">Confirmar Nova Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/30 rounded-xl px-12 pr-14 py-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                    placeholder="Confirme sua nova senha"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-green-200 text-sm font-medium">{success}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-red-200 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-2xl disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Processando...
                </div>
              ) : (
                getButtonText()
              )}
            </button>

            {/* Forgot Password Link (only on login) */}
            {currentView === 'login' && (
              <div className="text-center">
                <button
                  onClick={() => switchView('forgot')}
                  className="text-white/70 hover:text-white transition-colors text-sm font-medium underline underline-offset-2"
                >
                  Esqueci minha senha
                </button>
              </div>
            )}

            {/* Navigation Links */}
            <div className="text-center space-y-3 pt-4 border-t border-white/10">
              {currentView === 'login' && (
                <button
                  onClick={() => switchView('register')}
                  className="text-white/80 hover:text-white transition-colors text-sm"
                >
                  Não tem uma conta? <span className="font-semibold text-blue-300">Registre-se aqui</span>
                </button>
              )}
              
              {currentView === 'register' && (
                <button
                  onClick={() => switchView('login')}
                  className="text-white/80 hover:text-white transition-colors text-sm"
                >
                  Já tem uma conta? <span className="font-semibold text-blue-300">Faça login</span>
                </button>
              )}
              
              {currentView === 'forgot' && (
                <button
                  onClick={() => switchView('login')}
                  className="text-white/80 hover:text-white transition-colors text-sm"
                >
                  Lembrou da senha? <span className="font-semibold text-blue-300">Voltar ao login</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/50 text-sm">
            © 2025 Sistema de Autenticação. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;