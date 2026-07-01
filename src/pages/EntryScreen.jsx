import React, { useState } from 'react';
import { ArrowRight, Lock, Mail, ShieldCheck, UserPlus } from 'lucide-react';
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
      <section className="landingHero">
        <div className="heroBadge">EduSafe PH</div>
        <h1>Mobile school safety, attendance, and pickup control in one app.</h1>
        <p>Built for Philippine schools that need a clean parent, teacher, guard, and admin workflow on mobile.</p>

        <div className="heroActions">
          <button className="submitBtn" onClick={() => setView('login')}>Sign in</button>
          <button className="ghostBtn" onClick={() => setView('register')}>Create account</button>
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

      <section className="landingSection landingCards">
        {landingFeatures.map((feature) => (
          <article key={feature.title} className="landingCard">
            <span className="cardAccent" />
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </article>
        ))}
      </section>

      <section className="landingSection landingPreview">
        <div className="sectionTitleBlock">
          <span>Fast workflows</span>
          <h2>Visual role journeys for every school team.</h2>
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
            <p>Use your existing EduSafe account to sign in, or create a new one with your selected role.</p>
          </div>
          <ShieldCheck size={18} />
        </div>
        <button className="submitBtn" onClick={() => setView('login')}>
          <span>Continue to sign in</span>
          <ArrowRight size={16} />
        </button>
        <p className="miniNote">Register first to select your role, then sign in with that account.</p>
      </section>
    </div>
  );
}

function LoginScreen({ role, onBack, onRegister, onSubmit }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [feedback, setFeedback] = useState('');

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
          <div className="authInputWrap"><Mail size={16} /><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="name@school.edu.ph" required /></div>
        </label>
        <label className="authField">
          <span>Password</span>
          <div className="authInputWrap"><Lock size={16} /><input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Enter password" required /></div>
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
          <div className="authInputWrap"><UserPlus size={16} /><input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} placeholder="Juan Dela Cruz" required /></div>
        </label>
        <label className="authField">
          <span>Email</span>
          <div className="authInputWrap"><Mail size={16} /><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="name@school.edu.ph" required /></div>
        </label>
        <label className="authField">
          <span>Mobile number</span>
          <div className="authInputWrap"><ShieldCheck size={16} /><input value={form.mobile} onChange={(event) => setForm({ ...form, mobile: event.target.value })} placeholder="+63 9xx xxx xxxx" required /></div>
        </label>
        <label className="authField">
          <span>Password</span>
          <div className="authInputWrap"><Lock size={16} /><input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Create password" required /></div>
        </label>
        <label className="authField">
          <span>Confirm password</span>
          <div className="authInputWrap"><Lock size={16} /><input type="password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} placeholder="Repeat password" required /></div>
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
