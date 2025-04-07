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

const getUsers = async (params = {}) => {
  const users = await database.user.findMany({
    where: {
      ...params,
    },
  });

  return users;
};

const createUser = async (email, name, password) => {
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = await database.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    },
  });

  const apiKey = crypto.randomBytes(32).toString('hex');

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

module.exports = {
  getUser,
  getUsers,
  createUser,
  authenticateUser,
  verifyToken
};
