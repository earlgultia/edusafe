import { roleTabs } from '../appContent.js';

const roleNames = Object.keys(roleTabs);

function getAllowedTabs(role) {
  return roleTabs[role] || roleTabs.Admin;
}

function isTabAllowed(role, tab) {
  return getAllowedTabs(role).includes(tab);
}

function getDashboardStats(data) {
  return {
    total: data.students.length,
    present: data.students.filter((s) => s.status === 'Present' || s.status === 'Late').length,
    absent: data.students.filter((s) => s.status === 'Absent').length,
    visitors: data.visitors.filter((v) => v.status === 'On campus').length,
    pendingForms: data.forms.reduce((sum, form) => sum + Math.max(form.total - form.submitted, 0), 0)
  };
}

export { roleNames, getAllowedTabs, isTabAllowed, getDashboardStats };