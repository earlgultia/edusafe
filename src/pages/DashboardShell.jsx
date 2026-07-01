import React from 'react';

function DashboardShell({ title, subtitle, icon: Icon, children }) {
  return (
    <div className="stack">
      <section className="schoolHero">
        <div>
          <span>{title}</span>
          <h2>{subtitle}</h2>
        </div>
        <div className="seal"><Icon size={30} /></div>
      </section>
      {children}
    </div>
  );
}

export { DashboardShell };
