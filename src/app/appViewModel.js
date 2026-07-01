function getDashboardStats(data) {
  const students = data.students || [];
  const visitors = data.visitors || [];
  const forms = data.forms || [];

  return {
    total: students.length,
    present: students.filter((s) => s.status === 'Present' || s.status === 'Late').length,
    absent: students.filter((s) => s.status === 'Absent').length,
    visitors: visitors.filter((v) => v.status === 'On campus').length,
    pendingForms: forms.reduce((sum, form) => sum + Math.max(form.total - form.submitted, 0), 0)
  };
}

export { getDashboardStats };
