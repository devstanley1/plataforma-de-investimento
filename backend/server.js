require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

app.use(cors({ origin: '*'}));
app.use(express.json());

function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

app.post('/api/register', async (req, res) => {
  const { name, email, password, phone } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Senha deve ter pelo menos 6 caracteres.' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  try {
    const result = await db.query(
      'INSERT INTO users (name, email, phone, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, name, email',
      [name, email.toLowerCase(), phone || null, passwordHash]
    );
    const user = result.rows[0];
    const token = createToken(user);
    return res.status(201).json({ token, user });
  } catch (err) {
    if (err && err.code === '23505') {
      return res.status(409).json({ message: 'Email já cadastrado.' });
    }
    return res.status(500).json({ message: 'Erro ao criar conta.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const row = result.rows[0];
    if (!row) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const ok = bcrypt.compareSync(password, row.password_hash);
    if (!ok) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const user = { id: row.id, name: row.name, email: row.email };
    const token = createToken(user);
    return res.json({ token, user });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao autenticar.' });
  }
});

app.get('/api/me', (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Token ausente.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return res.json({ user: payload });
  } catch (e) {
    return res.status(401).json({ message: 'Token inválido.' });
  }
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`API rodando em http://localhost:${PORT}`);
  });
}

module.exports = app;
