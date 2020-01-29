import 'dotenv/config';

export default {
  secret: process.env.APP_TOKEN_HASH,
  expiresIn: '7d',
};
