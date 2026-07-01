import React, { useMemo, useState } from 'react';

function PeopleSheet({ close, data }) {
  const [activeTab, setActiveTab] = useState('students');
  const [query, setQuery] = useState('');

  const students = data.students || [];
  const teachers = data.teachers || [];
  const guardians = data.guardians || [];

  const filtered = useMemo(() => {
    const filterItems = (items, keys) => items.filter((item) =>
      keys.some((key) => String(item[key] || '').toLowerCase().includes(query.toLowerCase()))
    );

    return {
      students: filterItems(students, ['name', 'grade', 'section', 'guardian', 'status']),
      teachers: filterItems(teachers, ['name', 'position', 'advisory', 'email', 'employeeNo']),
      guardians: filterItems(guardians, ['name', 'relation', 'phone', 'qr'])
    };
  }, [query, students, teachers, guardians]);

  const lists = {
    students: filtered.students,
    teachers: filtered.teachers,
    guardians: filtered.guardians
  };

  const labels = {
    students: 'Students',
    teachers: 'Teachers',
    guardians: 'Guardians'
  };

  const activeList = lists[activeTab];

  return (
    <div className="peopleSheet">
      <div className="sheetIntro">
        <h3>People registry</h3>
        <p>Review the school’s students, teachers, and guardians in one searchable view.</p>
      </div>

      <div className="peopleControls">
        <div className="peopleTabs">
          {Object.entries(labels).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`tabButton ${activeTab === key ? 'active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="field searchField">
          <span>Search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search people by name, role, or status"
          />
        </label>
      </div>

      <section className="peopleSection">
        <div className="peopleSectionHeader">
          <h4>{labels[activeTab]}</h4>
          <span>{activeList.length} result{activeList.length === 1 ? '' : 's'}</span>
        </div>
        <div className="peopleList">
          {activeList.map((item) => (
            <article key={`${activeTab}-${item.id}`} className="peopleItem">
              <div>
                <strong>{item.name}</strong>
                <p>
                  {activeTab === 'students' && `${item.grade} • ${item.section}`}
                  {activeTab === 'teachers' && item.position}
                  {activeTab === 'guardians' && item.relation}
                </p>
              </div>
              <span>
                {activeTab === 'students' && item.status}
                {activeTab === 'teachers' && item.advisory}
                {activeTab === 'guardians' && (item.verified ? 'Verified' : 'Pending')}
              </span>
            </article>
          ))}
          {!activeList.length && <p className="emptyText">No matching records found.</p>}
        </div>
      </section>

      <button className="smallBtn" type="button" onClick={close}>Close</button>
    </div>
  );
}

export { PeopleSheet };