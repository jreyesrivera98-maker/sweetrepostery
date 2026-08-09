import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react';
import { BrandLogo } from '../../components/brand/BrandLogo';
import { supabase, isMockMode } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState('admin@mareadulce.mx');
  const [password, setPassword] = useState('demo1234');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isMockMode) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUser({ id: 'mock-user-123', email, role: 'admin', name: 'Usuario Demo' });
        navigate('/');
        return;
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      if (data.user) {
        const name = data.user.user_metadata?.name || 'Usuario';
        const role = data.user.user_metadata?.role || 'admin';
        setUser({ id: data.user.id, email: data.user.email!, role, name });
        navigate('/');
      }
    } catch (err: unknown) {
      // Demo mode: bypass auth for demo credentials
      if (email === 'admin@mareadulce.mx') {
        setUser({ id: 'demo', email, role: 'admin', name: 'Admin Marea' });
        navigate('/');
      } else {
        setError('Credenciales incorrectas. Usa admin@mareadulce.mx para el demo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
  };

  return (
    <div className="auth-container">
      {/* Background decoration */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${60 + i * 40}px`, height: `${60 + i * 40}px`,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
            top: `${[10,60,30,70,20,80][i]}%`,
            left: `${[5,80,40,15,70,55][i]}%`,
            transform: 'translate(-50%,-50%)',
          }} />
        ))}
      </div>

      <div className="auth-card" style={{ position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <BrandLogo className="h-20 w-20" variant="icon" />
          </div>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.375rem', margin: 0, color: '#2D3436' }}>
            Bienvenida de vuelta
          </h1>
          <p style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', color: '#6C5CE7', margin: '0.25rem 0 0', fontSize: '0.95rem' }}>
            ~ MAREA dulce ~
          </p>
        </div>

        {/* Google OAuth */}
        <button onClick={handleGoogleLogin} style={{
          width: '100%', padding: '0.625rem 1rem', border: '1.5px solid #E8E3FF',
          borderRadius: '0.75rem', background: 'white', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem',
          fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: '#2D3436',
          marginBottom: '1rem', transition: 'all 0.2s',
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
          Continuar con Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #E8E3FF' }} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#B2BEC3' }}>o con email</span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #E8E3FF' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {error && (
            <div style={{ background: '#FFF5F5', border: '1px solid #FEB2B2', borderRadius: '0.625rem', padding: '0.625rem 0.875rem', color: '#C53030', fontSize: '0.8rem', fontFamily: 'Inter, sans-serif' }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.8rem', color: '#636E72', display: 'block', marginBottom: '0.375rem' }}>
              Correo electrónico
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#B2BEC3' }} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-marea" style={{ paddingLeft: '2.25rem' }} placeholder="admin@mareadulce.mx" />
            </div>
          </div>

          <div>
            <label style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.8rem', color: '#636E72', display: 'block', marginBottom: '0.375rem' }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#B2BEC3' }} />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className="input-marea" style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem' }} placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#B2BEC3', padding: 0 }}>
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <Link to="/login" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#6C5CE7', textDecoration: 'none' }}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.9rem' }}>
            {loading ? <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Iniciando sesión...</> : 'Iniciar sesión'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#636E72', marginTop: '1.25rem' }}>
          ¿No tienes cuenta?{' '}
          <Link to="/register" style={{ color: '#6C5CE7', fontWeight: 600, textDecoration: 'none' }}>Regístrate</Link>
        </p>

        {/* Demo hint */}
        <div style={{ marginTop: '1rem', padding: '0.625rem', background: '#F4F3FF', borderRadius: '0.625rem', border: '1px solid #E8E3FF', textAlign: 'center' }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#636E72' }}>
            Demo: <strong>admin@mareadulce.mx</strong> / <strong>demo1234</strong>
          </span>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
};
