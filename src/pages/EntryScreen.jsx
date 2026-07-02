import React, { useState } from 'react';
import { ArrowRight, BellRing, BookOpenCheck, Clock3, Eye, EyeOff, Lock, Mail, ShieldCheck, Smartphone, Users2, UserPlus } from 'lucide-react';
import { landingFeatures, landingProof, landingStats, mvpScreens, roleProfiles } from '../appContent.js';
import { authenticateAccount, registerAccount } from './authAccounts.js';
import { inferRoleFromAccount, validateLoginForm, validateRegisterForm } from './authLogic.js';
function EntryScreen({ view, role, setRole, setView, signIn }) {
  if (view === 'login') {
    return <LoginScreen role={role} setRole={setRole} onBack={() => setView('landing')} onRegister={() => setView('register')} onSubmit={(nextRole) => signIn(nextRole)} />;
  }

  if (view === 'register') {
    return <RegisterScreen role={role} setRole={setRole} onBack={() => setView('landing')} onLogin={() => setView('login')} onSubmit={(nextRole) => signIn(nextRole)} />;
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

        <section className="landingSection landingPreview">
          <div className="sectionTitleBlock">
            <span>Fast workflows</span>
            <h2>Start in seconds with role-based screens built for daily use.</h2>
          </div>
          <div className="workflowList compact">
            {mvpScreens.slice(0, 4).map((screen) => (
              <article key={screen.title} className="workflowCard smallCard">
                <h3>{screen.title}</h3>
                <small>{screen.role}</small>
              </article>
            ))}
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

function LoginScreen({ role, onBack, onRegister, onSubmit }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [feedback, setFeedback] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = validateLoginForm({ ...form, fallbackRole: role });

    if (!result.ok) {
      setFeedback(result.message);
      return;
    }

    const authResult = await authenticateAccount({
      schoolId: '',
      email: form.email,
      password: form.password
    });

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
        <button className="backChip" onClick={onBack}>Back</button>
        <div className="authHeaderCopy">
          <span>Secure sign in</span>
          <h1>Welcome back to EduSafe PH</h1>
          <p>Enter your school access credentials to continue into the mobile workspace.</p>
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
        </label>

        {feedback ? <p className="authFeedback">{feedback}</p> : null}

        <button className="submitBtn" type="submit">Sign in</button>
        <button className="textLink" type="button" onClick={onRegister}>Need an account? Register</button>
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
        <button className="backChip" onClick={onBack}>Back</button>
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
