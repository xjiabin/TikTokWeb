const dotenv = require('dotenv');
dotenv.config();

const DYCOOKIE = process.env.DYCOOKIE || '{}';

module.exports = {
  DYCOOKIE: JSON.parse(DYCOOKIE)
}