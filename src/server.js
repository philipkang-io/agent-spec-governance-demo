const express = require('express');

const app = express();
app.use(express.json());

// In-memory store.
const contacts = new Map();
let seq = 1;

// Bearer auth middleware — returns 401 if Authorization header is missing/malformed.
function requireBearer(req, res, next) {
  const auth = req.headers['authorization'] || '';
  if (!auth.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ code: 401, message: 'Unauthorized' });
  }
  next();
}

app.get('/contacts', requireBearer, (req, res) => {
  res.json([...contacts.values()]);
});

app.post('/contacts', requireBearer, (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !email) {
    return res.status(400).json({ code: 400, message: 'name and email are required' });
  }
  const id = `c-${seq++}`;
  const contact = { id, name, email, phone: phone || '' };
  contacts.set(id, contact);
  res.status(201).json(contact);
});

app.get('/contacts/:id', requireBearer, (req, res) => {
  const contact = contacts.get(req.params.id);
  if (!contact) return res.status(404).json({ code: 404, message: 'Contact not found' });
  res.json(contact);
});

const port = process.env.PORT || 3010;
if (require.main === module) {
  app.listen(port, () => console.log(`contacts api on :${port}`));
}

module.exports = app;
