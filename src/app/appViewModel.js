function getDashboardStats(data) {
  return {
    total: data.students.length,
    present: data.students.filter((s) => s.status === 'Present' || s.status === 'Late').length,
    absent: data.students.filter((s) => s.status === 'Absent').length,
    visitors: data.visitors.filter((v) => v.status === 'On campus').length,
    pendingForms: data.forms.reduce((sum, form) => sum + Math.max(form.total - form.submitted, 0), 0)
  };
}

export { getDashboardStats };