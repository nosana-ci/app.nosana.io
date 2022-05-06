const path = require('path');
const fs = require('fs');

const env = process.env.APP_ENV || process.env.NODE_ENV;

console.log('ENV', env);
const localEnvPath = path.resolve(process.cwd(), '.env.local');
const envPath = path.resolve(process.cwd(), `.env.${env}`);
const defaultEnvPath = path.resolve(process.cwd(), '.env');

const envFile = fs.existsSync(localEnvPath) ? localEnvPath : fs.existsSync(envPath) ? envPath : defaultEnvPath;

require('dotenv').config({
  path: envFile
});
