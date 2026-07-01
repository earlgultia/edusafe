const today = new Date().toLocaleDateString('en-PH', {
  weekday: 'short',
  month: 'short',
  day: 'numeric'
});

export { today };
