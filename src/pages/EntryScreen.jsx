import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, BellRing, BookOpenCheck, Clock3, Eye, EyeOff, Lock, Mail, ShieldCheck, Smartphone, Users2, UserPlus } from 'lucide-react';
import { landingFeatures, landingProof, landingStats, mvpScreens, roleProfiles } from '../appContent.js';
import { authenticateAccount, registerAccount } from './authAccounts.js';
import { inferRoleFromAccount, validateLoginForm, validateRegisterForm } from './authLogic.js';
function EntryScreen({ view, role, setRole, setView, signIn }) {
  if (view === 'login') {
    return <LoginScreen role={role} setRole={setRole} onBack={() => setView('landing')} onRegister={() => setView('register')} onForgot={() => setView('forgot')} onSubmit={(nextRole) => signIn(nextRole)} />;
  }

  if (view === 'forgot') {
    return <ForgotPasswordScreen onBack={() => setView('login')} />;
  }

  if (view === 'register') {
    return (
      <RegisterScreen
        role={role}
        setRole={setRole}
        onBack={() => setView('landing')}
        onLogin={() => setView('login')}
        onSubmit={(account) => {
          // After successful registration, don't auto-sign-in.
          // Redirect user to the login view and prefill the role.
          try {
            if (account?.role) setRole(account.role);
          } catch (e) {
            // ignore
          }
          setView('login');
        }}
      />
    );
  }

  return (
    <div className="authScreen landingMode">
      <div className="landingShell">
        <section className="landingHero">
          <div className="heroTopLine">
            <span className="heroBadge"><ShieldCheck size={14} /> EduSafe PH</span>
            <span className="heroBadge ghostPill">Mobile-ready</span>
          </div>
          <h1>Safe school access, attendance, and pickup in one app.</h1>
          <p>Simple mobile workflows for parents, teachers, guards, and school staff.</p>

          <div className="heroBullets">
            <span><ShieldCheck size={14} /> Secure sign-in</span>
            <span><Clock3 size={14} /> Fast check-ins</span>
            <span><BellRing size={14} /> Instant alerts</span>
          </div>

          <div className="heroActions">
            <button className="submitBtn" onClick={() => setView('login')}>
              <span>Sign in</span>
              <ArrowRight size={16} />
            </button>
            <button className="ghostBtn" onClick={() => setView('register')}>
              <UserPlus size={16} />
              <span>Create account</span>
            </button>
          </div>

          <div className="proofStrip">
            {landingProof.map((item) => (
              <article key={item.label} className="proofCard">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="landingSection">
          <div className="sectionTitleBlock">
            <span>Made for every school role</span>
            <h2>Everything your team needs, packed into a simple mobile experience.</h2>
          </div>
          <div className="landingCards">
            {landingFeatures.map((feature, index) => {
              const iconMap = [
                <Smartphone size={16} key="smartphone" />,
                <Users2 size={16} key="users" />,
                <BookOpenCheck size={16} key="book" />,
                <BellRing size={16} key="bell" />
              ];
              return (
                <article key={feature.title} className="landingCard">
                  <span className="cardAccent" />
                  <div className="landingCardIcon">{iconMap[index] || <ShieldCheck size={16} />}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="authCard authPanel">
          <div className="authCardHead">
            <div>
              <h2>Quick access</h2>
              <p>Sign in or create a profile to start using EduSafe mobile tools.</p>
            </div>
            <ShieldCheck size={18} />
          </div>
          <button className="submitBtn" onClick={() => setView('login')}>
            <span>Continue</span>
            <ArrowRight size={16} />
          </button>
          <p className="miniNote">Register to choose your role and access your dashboard.</p>
        </section>
      </div>
    </div>
  );
}

function LoginScreen({ role, onBack, onRegister, onForgot, onSubmit }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [feedback, setFeedback] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleForgotPassword = () => {
    if (typeof onForgot === 'function') {
      onForgot();
      return;
    }
    const email = form.email || window.prompt('Enter your email address to reset your password:');
    if (!email) {
      setFeedback('Please provide an email to reset your password.');
      return;
    }
    // Simulate reset flow - replace with real endpoint when available
    setFeedback(`If an account exists for ${email}, a password reset link has been sent.`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    const result = validateLoginForm({ ...form, fallbackRole: role });
    if (!result.ok) {
      setFeedback(result.message);
      return;
    }

    setLoading(true);
    setFeedback('Signing in...');

    const authResult = await authenticateAccount({
      schoolId: '',
      email: form.email,
      password: form.password,
      fallbackRole: role || 'Admin'
    });

    setLoading(false);
    if (!authResult.ok) {
      setFeedback(authResult.message);
      return;
    }

    setFeedback('');
    onSubmit({ role: authResult.role, fullName: authResult.account?.fullName || form.email, email: form.email });
  };

  return (
    <div className="authScreen formMode">
      <section className="authHeaderCard">
        <div className="authHeaderCopy">
          <h1>Welcome back to EduSafe PH</h1>
          <p>Enter your school access credentials to continue into the mobile workspace.</p>
          <div className="authPortalBadge" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginTop: '0.85rem', padding: '0', borderRadius: '0', background: 'transparent', color: '#1d4ed8', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.01em' }}>
            <span>Secured Access Portal by: ArkByte Technologies</span>
          </div>
        </div>
      </section>

      <form className="authFormCard" onSubmit={handleSubmit}>
        <label className="authField">
          <span>Email</span>
          <div className="authInputWrap"><Mail size={16} /><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Email address" required /></div>
        </label>
        <label className="authField">
          <span>Password</span>
          <div className="authInputWrap">
            <Lock size={16} />
            <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Enter password" required />
            <button type="button" className="passwordToggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" className="textLink rightLink" onClick={handleForgotPassword} disabled={loading}>Forgot password?</button>
          </div>
        </label>

        {feedback ? <p className="authFeedback">{feedback}</p> : null}

        <button className="submitBtn" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
        <button className="backChip" type="button" onClick={onBack} disabled={loading}>Back</button>
        <button className="textLink" type="button" onClick={onRegister} disabled={loading}>Need an account? Register</button>
      </form>
    </div>
  );
}

function RegisterScreen({ role, setRole, onBack, onLogin, onSubmit }) {
  const [form, setForm] = useState({ fullName: '', email: '', mobile: '', password: '', confirmPassword: '' });
  const [feedback, setFeedback] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const inferredRole = inferRoleFromAccount(form.email, role);
  const availableRoles = Object.keys(roleProfiles);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = validateRegisterForm({ ...form, fallbackRole: role });

    if (!result.ok) {
      setFeedback(result.message);
      return;
    }

    const registerRole = role || result.role;
    const registerResult = await registerAccount({
      fullName: form.fullName,
      email: form.email,
      schoolId: '',
      password: form.password,
      role: registerRole,
      phone: form.mobile
    });

    if (!registerResult.ok) {
      setFeedback(registerResult.message);
      return;
    }

    setFeedback('');
    onSubmit({ role: registerRole, fullName: form.fullName, email: form.email });
  };

  return (
    <div className="authScreen formMode">
      <section className="authHeaderCard registerHeader">
        <div className="authHeaderCopy">
          <span>Create your account</span>
          <h1>Set up your EduSafe PH profile</h1>
          <p>Create an account for your school role so you can access the mobile tools from one place.</p>
        </div>
      </section>

      <form className="authFormCard" onSubmit={handleSubmit}>
        <label className="authField">
          <span>Full name</span>
          <div className="authInputWrap"><UserPlus size={16} /><input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} placeholder="Full name" required /></div>
        </label>
        <label className="authField">
          <span>Email</span>
          <div className="authInputWrap"><Mail size={16} /><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Email address" required /></div>
        </label>
        <label className="authField">
          <span>Mobile number</span>
          <div className="authInputWrap"><ShieldCheck size={16} /><input value={form.mobile} onChange={(event) => setForm({ ...form, mobile: event.target.value })} placeholder="Mobile number" required /></div>
        </label>
        <label className="authField">
          <span>Password</span>
          <div className="authInputWrap">
            <Lock size={16} />
            <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Create password" required />
            <button type="button" className="passwordToggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>
        <label className="authField">
          <span>Confirm password</span>
          <div className="authInputWrap">
            <Lock size={16} />
            <input type={showConfirmPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} placeholder="Repeat password" required />
            <button type="button" className="passwordToggle" onClick={() => setShowConfirmPassword((value) => !value)} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>

        <button type="button" className="roleSelectBtn" onClick={() => setShowRoleModal(true)}>
          <span className="roleSelectLabel">Role</span>
          <strong>{role || 'Choose role'}</strong>
        </button>

        <div className="loginRoleHint registerRoleHint">
          <ShieldCheck size={16} />
          <span>Role detected from your email: <strong>{inferredRole}</strong></span>
        </div>

        {showRoleModal ? (
          <div className="overlay" onClick={() => setShowRoleModal(false)}>
            <div className="sheet" onClick={(event) => event.stopPropagation()}>
              <div className="sheetHead">
                <div>
                  <h2>Select your role</h2>
                  <p className="sheetSubtitle">Choose the profile that matches how you’ll use EduSafe PH.</p>
                </div>
                <button type="button" className="textButton" onClick={() => setShowRoleModal(false)}>Cancel</button>
              </div>
              <div className="roleModalGrid">
                {availableRoles.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={role === option ? 'roleOption active' : 'roleOption'}
                    onClick={() => {
                      setRole(option);
                      setShowRoleModal(false);
                    }}
                  >
                    <div className="roleOptionTitle">{option}</div>
                    <div className="roleOptionSubtitle">{roleProfiles[option]?.subtitle}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {feedback ? <p className="authFeedback">{feedback}</p> : null}

        <button className="submitBtn" type="submit">Create account</button>
        <button className="backChip" type="button" onClick={onBack}>Back</button>
        <button className="textLink" type="button" onClick={onLogin}>Already have an account? Sign in</button>
      </form>
    </div>
  );
}

function AccessBlocked({ role, setTab }) {
  return (
    <section className="blockedState">
      <ShieldCheck size={30} />
      <h2>Access limited for {role}</h2>
      <p>This role does not have permission to open that area. Return to the dashboard or sign in with another role.</p>
      <button className="submitBtn" onClick={() => setTab('dashboard')}>Back to dashboard</button>
    </section>
  );
}

export { EntryScreen, AccessBlocked };

function ForgotPasswordScreen({ onBack }) {
  const [step, setStep] = useState('request'); // request, verify, reset, done
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [expectedCode, setExpectedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef(null);

  const startResendTimer = (seconds = 60) => {
    setResendTimer(seconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const sendCode = async () => {
    if (loading) return;
    if (!email || !email.includes('@')) {
      setFeedback('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch('/api/auth/send-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const json = await resp.json().catch(() => ({}));
      setLoading(false);
      if (!resp.ok) {
        setFeedback(json?.error || 'Failed to send verification code.');
        return;
      }
      setFeedback(`A verification code was sent to ${email}.`);
      setStep('verify');
      startResendTimer(60);
      // show debug code in console if returned (development)
      if (json?.debugCode) console.info('DEBUG: verification code for', email, json.debugCode);
    } catch (e) {
      setLoading(false);
      setFeedback('Network error sending verification code.');
    }
  };

  const verifyCode = async () => {
    if (loading) return;
    if (!code) {
      setFeedback('Enter the verification code you received.');
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch('/api/auth/verify-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      const json = await resp.json().catch(() => ({}));
      setLoading(false);
      if (!resp.ok) {
        setFeedback(json?.error || 'Verification failed.');
        return;
      }
      setFeedback('Code verified — you can now set a new password.');
      setStep('reset');
    } catch (e) {
      setLoading(false);
      setFeedback('Network error verifying code.');
    }
  };

  const submitNewPassword = async () => {
    if (loading) return;
    if (!newPassword || newPassword.length < 6) {
      setFeedback('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword })
      });
      const json = await resp.json().catch(() => ({}));
      setLoading(false);
      if (!resp.ok) {
        setFeedback(json?.error || 'Failed to reset password.');
        return;
      }

      // Update local stored accounts (if present) so user can sign in locally
      try {
        const key = 'edusafe-accounts';
        const raw = localStorage.getItem(key);
        if (raw) {
          const accounts = JSON.parse(raw || '[]');
          const lower = String(email || '').toLowerCase();
          const updated = accounts.map((a) => (String(a.email || '').toLowerCase() === lower ? { ...a, password: newPassword } : a));
          localStorage.setItem(key, JSON.stringify(updated));
        }
      } catch (e) {
        // ignore storage update errors
      }

      setFeedback('Your password has been reset. You can now sign in with your new password.');
      setStep('done');
    } catch (e) {
      setLoading(false);
      setFeedback('Network error resetting password.');
    }
  };

  return (
    <div className="authScreen formMode">
      <section className="authHeaderCard">
        <div className="authHeaderCopy">
          <h1>{step === 'request' ? 'Reset your password' : step === 'verify' ? 'Verify code' : step === 'reset' ? 'Set a new password' : 'Done'}</h1>
          <p>
            {step === 'request' && 'Enter the email associated with your account and we will send a verification code.'}
            {step === 'verify' && `We sent a code to ${email}. Enter it below.`}
            {step === 'reset' && 'Enter your new password.'}
            {step === 'done' && 'Password reset complete.'}
          </p>
        </div>
      </section>

      <form className="authFormCard" onSubmit={(e) => e.preventDefault()}>
        {step === 'request' ? (
          <>
            <label className="authField">
              <span>Email</span>
              <div className="authInputWrap"><Mail size={16} /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" required /></div>
            </label>

            {feedback ? <p className="authFeedback">{feedback}</p> : null}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button className="submitBtn" type="button" onClick={sendCode} disabled={loading}>{loading ? 'Sending…' : 'Send code'}</button>
              <button className="backChip" type="button" onClick={onBack} disabled={loading}>Back</button>
            </div>
          </>
        ) : step === 'verify' ? (
          <>
            <label className="authField">
              <span>Verification code</span>
              <div className="authInputWrap"><Mail size={16} /><input type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter code" required /></div>
            </label>

            {feedback ? <p className="authFeedback">{feedback}</p> : null}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button className="submitBtn" type="button" onClick={verifyCode} disabled={loading}>{loading ? 'Verifying…' : 'Verify code'}</button>
              <button className="backChip" type="button" onClick={() => setStep('request')} disabled={loading}>Change email</button>
              <button className="textLink rightLink" type="button" onClick={sendCode} disabled={loading || resendTimer > 0}>{resendTimer > 0 ? `Resend code (${resendTimer}s)` : 'Resend code'}</button>
            </div>
          </>
        ) : step === 'reset' ? (
          <>
            <label className="authField">
              <span>New password</span>
              <div className="authInputWrap"><Lock size={16} /><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" required /></div>
            </label>
            <label className="authField">
              <span>Confirm password</span>
              <div className="authInputWrap"><Lock size={16} /><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" required /></div>
            </label>

            {feedback ? <p className="authFeedback">{feedback}</p> : null}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button className="submitBtn" type="button" onClick={submitNewPassword} disabled={loading}>{loading ? 'Saving…' : 'Save new password'}</button>
              <button className="backChip" type="button" onClick={() => setStep('verify')} disabled={loading}>Back</button>
            </div>
          </>
        ) : (
          <>
            {feedback ? <p className="authFeedback">{feedback}</p> : null}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="submitBtn" type="button" onClick={onBack}>Back to sign in</button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
