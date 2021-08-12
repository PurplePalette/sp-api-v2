import * as serviceAccount from './serviceAccount.json'

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

/**
 * Global configuration of sonolus-uploader-core2
*/
export const config : GlobalConfig = {
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

export const firebaseParams = {
  type: serviceAccount.type,
  projectId: serviceAccount.project_id,
  privateKeyId: serviceAccount.private_key_id,
  privateKey: serviceAccount.private_key,
  clientEmail: serviceAccount.client_email,
  clientId: serviceAccount.client_id,
  authUri: serviceAccount.auth_uri,
  tokenUri: serviceAccount.token_uri,
  authProviderX509CertUrl: serviceAccount.auth_provider_x509_cert_url,
  clientC509CertUrl: serviceAccount.client_x509_cert_url
}