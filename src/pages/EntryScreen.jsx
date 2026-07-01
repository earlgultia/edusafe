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

      <section className="landingSection landingStats">
        {landingStats.map((item) => (
          <article className="statPill" key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </article>
        ))}
      </section>

      <section className="landingSection">
        <div className="sectionTitleBlock">
          <span>Why schools use it</span>
          <h2>Simple operational tools, designed for safety first.</h2>
        </div>
        <div className="featureList">
          {landingFeatures.map((feature) => (
            <article key={feature.title} className="featureCard">
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landingSection showcasePanel">
        <div className="sectionTitleBlock">
          <span>Workflow preview</span>
          <h2>One mobile flow for every role.</h2>
        </div>
        <div className="workflowList">
          {mvpScreens.map((screen) => (
            <article key={screen.title} className="workflowCard">
              <div>
                <h3>{screen.title}</h3>
                <p>{screen.description}</p>
              </div>
              <small>{screen.role}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="landingSection trustPanel">
        <div className="sectionTitleBlock">
          <span>Trusted by design</span>
          <h2>Professional access with clear roles and secure handling.</h2>
        </div>
        <div className="trustGrid">
          <article>
            <ShieldCheck size={20} />
            <h3>Role-based access</h3>
            <p>Each screen is shaped for how admins, teachers, parents, guards, and nurses actually work.</p>
          </article>
          <article>
            <ShieldCheck size={20} />
            <h3>Verified workflows</h3>
            <p>Attendance, pickup, and visitor steps stay readable and auditable on a phone.</p>
          </article>
        </div>
      </section>

      <section className="authCard authPanel">
        <div className="authCardHead">
          <div>
            <h2>Quick demo access</h2>
            <p>Jump in with a role preview to see the workspace.</p>
          </div>
          <ShieldCheck size={18} />
        </div>
        <div className="authRoleList">
          {Object.entries(roleProfiles).map(([name, info]) => (
            <button key={name} className={role === name ? 'active' : ''} onClick={() => setRole(name)}>
              <strong>{name}</strong>
              <span>{info.subtitle}</span>
            </button>
          ))}
        </div>
        <button className="submitBtn" onClick={() => signIn({ role, fullName: `${role} demo` })}>
          <span>Open demo</span>
          <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
}

function LoginScreen({ role, setRole, onBack, onRegister, onSubmit }) {
  const [form, setForm] = useState({ email: '', password: '', schoolId: '' });
  const [feedback, setFeedback] = useState('');
  const inferredRole = inferRoleFromAccount(form.email, role);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = validateLoginForm({ ...form, fallbackRole: role });

    if (!result.ok) {
      setFeedback(result.message);
      return;
    }

    const authResult = await authenticateAccount({
      schoolId: form.schoolId,
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
          <span>School ID</span>
          <div className="authInputWrap"><ShieldCheck size={16} /><input value={form.schoolId} onChange={(event) => setForm({ ...form, schoolId: event.target.value })} placeholder="ESP-2026-001" required /></div>
        </label>
        <label className="authField">
          <span>Email</span>
          <div className="authInputWrap"><Mail size={16} /><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="name@school.edu.ph" required /></div>
        </label>
        <label className="authField">
          <span>Password</span>
          <div className="authInputWrap"><Lock size={16} /><input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Enter password" required /></div>
        </label>

        <div className="loginRoleHint">
          <ShieldCheck size={16} />
          <span>Role detected from your email: <strong>{inferredRole}</strong></span>
        </div>

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
  const inferredRole = inferRoleFromAccount(form.email, role);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = validateRegisterForm({ ...form, fallbackRole: role });

    if (!result.ok) {
      setFeedback(result.message);
      return;
    }

    const registerResult = await registerAccount({
      fullName: form.fullName,
      email: form.email,
      schoolId: form.mobile,
      password: form.password,
      role: result.role,
      phone: form.mobile
    });

    if (!registerResult.ok) {
      setFeedback(registerResult.message);
      return;
    }

    setFeedback('');
    onSubmit({ role: result.role, fullName: form.fullName, email: form.email });
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

        <div className="loginRoleHint registerRoleHint">
          <ShieldCheck size={16} />
          <span>Role detected from your email: <strong>{inferredRole}</strong></span>
        </div>

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
