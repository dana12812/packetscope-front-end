import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router';

import * as authService from '../../services/authService';
import { UserContext } from '../../contexts/UserContext';
import AuthLayout from '../AuthLayout/AuthLayout';

const SignUpForm = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    passwordConf: '',
  });
  const { setUser } = useContext(UserContext);

  const { username, email, password, passwordConf } = formData;

  const handleChange = (evt) => {
    setMessage('');
    setFormData({ ...formData, [evt.target.name]: evt.target.value });
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setSubmitting(true);
    try {
      const payload = { username, email, password };
      const user = await authService.signUp(payload)
      setUser(user);
      navigate('/')
    } catch (err) {
      setMessage(err.message);
      setSubmitting(false);
    }
  };

  const passwordsDiffer = Boolean(passwordConf) && password !== passwordConf;

  const isFormInvalid = () => {
    return !(username && email && password && password === passwordConf);
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start analyzing packet captures in a minute."
      footer={<>Already have an account? <Link to='/sign-in'>Sign in</Link></>}
    >
      {message && <p className="error" role="alert">{message}</p>}
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor='username'>Username</label>
          <input type='text' id='username' value={username} name='username' onChange={handleChange} autoComplete='username' required />
        </div>
        <div className="field">
          <label htmlFor='email'>Email</label>
          <input type='email' id='email' value={email} name='email' onChange={handleChange} autoComplete='email' required />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor='password'>Password</label>
            <input type='password' id='password' value={password} name='password' onChange={handleChange} autoComplete='new-password' required />
          </div>
          <div className="field">
            <label htmlFor='confirm'>Confirm password</label>
            <input
              type='password'
              id='confirm'
              value={passwordConf}
              name='passwordConf'
              onChange={handleChange}
              autoComplete='new-password'
              aria-invalid={passwordsDiffer}
              aria-describedby={passwordsDiffer ? 'confirm-hint' : undefined}
              required
            />
          </div>
        </div>
        {passwordsDiffer && <p className="field-hint is-error" id="confirm-hint">Passwords don't match yet.</p>}
        <div className="form-actions">
          <button className="btn btn-accent btn-block" disabled={isFormInvalid() || submitting}>
            {submitting ? <><span className="spinner spinner-dark" aria-hidden="true" />Creating account…</> : 'Create account'}
          </button>
          <button className="btn btn-ghost btn-block" type='button' onClick={() => navigate('/')}>Cancel</button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default SignUpForm;
