const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const { PrismaClient } = require('@database/client');

const database = new PrismaClient(), saltRounds = 10;

const getUser = async (id) => {
  const user = await database.user?.findUnique({
    where: { id }
  });

  return user;
};

function generateApiKey() {
  return crypto.randomBytes(32).toString('hex');
}

const createUser = async (email, name, password) => {
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = await database.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    },
  });

  const apiKey = generateApiKey();

  await database.apiKey.create({
    data: {
      key: apiKey,
      userId: user.id,
    },
  });

  return user;
};

const authenticateUser = async (email, password) => {
  const user = await database?.user?.findUnique({ where: { email } });

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Senha incorreta');
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7h' }
  );

  return token;
};

const verifyToken = (req, res, next) => {
  const token = req?.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token is need.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token is invalid.' });
    }

    req.user = decoded;

    next();
  });
};

const reqGetUser = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return;
    }

    const apiKey = authHeader.split(' ')[1];
    if (!apiKey) {
      return;
    }

    const user = await getUserByApiKey(apiKey);

    if (!user) {
      return;
    }

    req.user = user;
    req.apiKey = apiKey;

    next();
  } catch (error) {
    console.error('Erro no middleware reqGetUser:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

const verifyApiKey = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'API Key is required in the Authorization header.' });
    }

    const apiKey = authHeader.split(' ')[1];
    if (!apiKey) {
      return res.status(401).json({ message: 'API Key is missing.' });
    }

    const user = await getUserByApiKey(apiKey);

    if (!user) {
      return res.status(401).json({ message: 'Invalid or unauthorized API Key.' });
    }

    req.user = user;
    req.apiKey = apiKey;

    next();
  } catch (error) {
    console.error('Erro no middleware verifyApiKey:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = {
  getUser,
  createUser,
  authenticateUser,
  reqGetUser,
  verifyToken,
  verifyApiKey
};
