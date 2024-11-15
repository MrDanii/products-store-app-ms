import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number,
  NATS_SERVERS: string[],
  JWT_SECRET: string,
  JWT_EXPIRE_TIME: string
}

const envsSchema = joi.object({
  PORT: joi.number().required(),
  NATS_SERVERS: joi.array().items(joi.string()).required(),
  JWT_SECRET: joi.string().required(),
  JWT_EXPIRE_TIME: joi.string().required()
})
.unknown(true)

const {value, error} = envsSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(',')
})

if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

const envVars: EnvVars = value

export const envs = {
  port: envVars.PORT,
  natsServers: envVars.NATS_SERVERS,
  jwtSecret: envVars.JWT_SECRET,
  jwtExpireTime: envVars.JWT_EXPIRE_TIME
}