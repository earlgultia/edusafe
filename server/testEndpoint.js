import http from 'http';
http.get('http://localhost:4000/api/lostfound', (res) => {
  console.log('STATUS', res.statusCode);
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('BODY', body);
  });
}).on('error', (err) => {
  console.error('ERROR', err.message);
});
