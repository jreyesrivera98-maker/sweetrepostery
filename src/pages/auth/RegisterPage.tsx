import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, Loader2 } from 'lucide-react';
import { BrandLogo } from '../../components/brand/BrandLogo';
import { supabase, isMockMode } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import type { UserRole } from '../../types';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('seller');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError('Las contraseñas no coinciden'); return; }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    setLoading(true);
    setError('');
    try {
      if (isMockMode) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUser({ id: Math.random().toString(36).substr(2, 9), email, role, name });
        navigate('/');
        return;
      }

      const { data, error: authError } = await supabase.auth.signUp({ email, password, options: { data: { name, role } } });
      if (authError) throw authError;
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email!, role, name });
        navigate('/');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al crear cuenta';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <BrandLogo className="h-16 w-16" variant="icon" />
          </div>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.25rem', margin: 0, color: '#2D3436' }}>
            Crear cuenta
          </h1>
          <p style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', color: '#6C5CE7', margin: '0.25rem 0 0', fontSize: '0.875rem' }}>
            ~ MAREA dulce ~
          </p>
        </div>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {error && (
            <div style={{ background: '#FFF5F5', border: '1px solid #FEB2B2', borderRadius: '0.625rem', padding: '0.625rem 0.875rem', color: '#C53030', fontSize: '0.8rem', fontFamily: 'Inter, sans-serif' }}>
              {error}
            </div>
          )}
          {/* Name */}
          <div>
            <label style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.8rem', color: '#636E72', display: 'block', marginBottom: '0.35rem' }}>Nombre completo</label>
            <div style={{ position: 'relative' }}>
              <User size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#B2BEC3' }} />
              <input type="text" value={name} onChange={e => setName(e.target.value)} required className="input-marea" style={{ paddingLeft: '2.25rem' }} placeholder="Tu nombre" />
            </div>
          </div>
          {/* Email */}
          <div>
            <label style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.8rem', color: '#636E72', display: 'block', marginBottom: '0.35rem' }}>Correo electrónico</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#B2BEC3' }} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-marea" style={{ paddingLeft: '2.25rem' }} placeholder="tu@email.com" />
            </div>
          </div>
          {/* Role */}
          <div>
            <label style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.8rem', color: '#636E72', display: 'block', marginBottom: '0.35rem' }}>Rol en el equipo</label>
            <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="input-marea">
              <option value="admin">Administrador — Acceso total</option>
              <option value="baker">Pastelero/a — Cocina e inventario</option>
              <option value="seller">Vendedor/a — Cotizador y clientes</option>
            </select>
          </div>
          {/* Password */}
          <div>
            <label style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.8rem', color: '#636E72', display: 'block', marginBottom: '0.35rem' }}>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#B2BEC3' }} />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className="input-marea" style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem' }} placeholder="Mínimo 6 caracteres" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#B2BEC3', padding: 0 }}>
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          {/* Confirm password */}
          <div>
            <label style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '0.8rem', color: '#636E72', display: 'block', marginBottom: '0.35rem' }}>Confirmar contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#B2BEC3' }} />
              <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="input-marea" style={{ paddingLeft: '2.25rem' }} placeholder="Repite tu contraseña" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {loading ? <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Creando cuenta...</> : 'Crear cuenta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#636E72', marginTop: '1rem' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: '#6C5CE7', fontWeight: 600, textDecoration: 'none' }}>Iniciar sesión</Link>
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
};
