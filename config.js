const path = require('path')
const fs = require('fs')

const env = process.env.APP_ENV || process.env.NODE_ENV

const envPath = path.resolve(process.cwd(), `.env.${env}`)
const defaultEnvPath = path.resolve(process.cwd(), '.env')

const envFile = fs.existsSync(envPath) ? envPath : defaultEnvPath

require('dotenv').config({
  path: envFile
})
