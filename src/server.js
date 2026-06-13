const express = require('express');

const app = express();
app.use(express.json());

// In-memory store.
// NOTE (demo): the backend deliberately uses snake_case / short field names
// (customer_id, phone, email). The OpenAPI contract + collection examples use
// camelCase / long names (customerId, phoneNumber, emailAddress). That divergence
// is the planted drift the Autonomous Engineer reconciles in the final demo beat.
const contacts = new Map();
let seq = 1;

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/contacts', (req, res) => {
  res.json([...contacts.values()]);
});

app.post('/contacts', (req, res) => {
  const id = `c-${seq++}`;
  const contact = {
    id,
    customer_id: req.body.customer_id || null,
    name: req.body.name || '',
    phone: req.body.phone || '',
    email: req.body.email || ''
  };
  contacts.set(id, contact);
  res.status(201).json(contact);
});

app.get('/contacts/:id', (req, res) => {
  const contact = contacts.get(req.params.id);
  if (!contact) return res.status(404).json({ error: 'not_found' });
  res.json(contact);
});

const port = process.env.PORT || 3010;
if (require.main === module) {
  app.listen(port, () => console.log(`contacts api on :${port}`));
}

module.exports = app;
