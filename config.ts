import * as firebase from 'firebase-admin'
import fs from 'fs'

export interface SonolusOptions {
  /**
   * Sonolus-client-version (Strict)
  */
  version: string,
  /**
   * Specifies sonolus-express endpoint.
   * Ex. If specify /api, you access with http://localhost:3000/api
  */
  basePath: string,
  /**
   * Default locale of sonolus content
  */
  fallbackLocale: string
}

export interface GlobalConfig {
  /**
   * Running port of server
  */
  port: number,
  /**
   * User uploaded files will stored to here
  */
  uploads: string,
  /**
   * Static files (sonolus-server-landing and others) will stored to here
  */
  static: string,
  /**
   * Packed files (sonolus-pack) will stored to here
  */
  packer: string,
  /**
   * Base engine of level
  */
  engine: string,
  /**
   * Max file size of upload
   */
  maxSize: number,
  /**
   * Options of sonolus-express
   */
  sonolusOptions: SonolusOptions,
}

export interface ServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

/**
 * Global configuration of sonolus-uploader-core2
*/
let conf: GlobalConfig = {
  port: 3000,
  uploads: './uploads',
  static: './public',
  packer: './db/pack',
  engine: 'pjsekai',
  maxSize: 15 * 1024 * 1024,
  sonolusOptions: {
    version: '0.5.5',
    basePath: '',
    fallbackLocale: 'ja'
  }
}
try {
  const rawConfig = fs.readFileSync('./config/settings.json', 'utf8')
  conf = JSON.parse(rawConfig) as GlobalConfig
} catch {
  console.log('Failed to load settings.json, using default conf.')
}

export const config : GlobalConfig = conf

/**
 * Service account for firebase authorization
*/
const fireConf: firebase.ServiceAccount = {
  clientEmail: '',
  privateKey: '',
  projectId: ''
}

try {
  const rawSA = fs.readFileSync('./config/serviceAccount.json', 'utf8')
  const sa = JSON.parse(rawSA) as ServiceAccount
  fireConf.clientEmail = sa.client_email
  fireConf.privateKey = sa.private_key
  fireConf.projectId = sa.project_id
} catch {
  console.log('Failed to load serviceAccount.json, using default conf.')
}

export const firebaseParams: firebase.ServiceAccount = fireConf
