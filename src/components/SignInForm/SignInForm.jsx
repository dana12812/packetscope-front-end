import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router';

import { signIn } from '../../services/authService';
import { UserContext } from '../../contexts/UserContext';
import AuthLayout from '../AuthLayout/AuthLayout';

const SignInForm = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (evt) => {
    setMessage('');
    setFormData({ ...formData, [evt.target.name]: evt.target.value });
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setSubmitting(true);
    try {
      const signedInUser = await signIn(formData);
      setUser(signedInUser);
      navigate('/');
    } catch (err) {
      setMessage(err.message);
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to see your captures and analyses."
      footer={<>New to PacketScope? <Link to='/sign-up'>Create an account</Link></>}
    >
      {message && <p className="error" role="alert">{message}</p>}
      <form className="auth-form" autoComplete='off' onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor='username'>Username</label>
          <input type='text' autoComplete='off' id='username' value={formData.username} name='username' onChange={handleChange} required />
        </div>
        <div className="field">
          <label htmlFor='password'>Password</label>
          <input type='password' autoComplete='off' id='password' value={formData.password} name='password' onChange={handleChange} required />
        </div>
        <div className="form-actions">
          <button className="btn btn-accent btn-block" disabled={submitting}>
            {submitting ? <><span className="spinner spinner-dark" aria-hidden="true" />Signing in…</> : 'Sign in'}
          </button>
          <button className="btn btn-ghost btn-block" type='button' onClick={() => navigate('/')}>Cancel</button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default SignInForm;
