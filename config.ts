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
  uploads: 'uploads/',
  static: './public',
  maxSize: 15 * 1024 * 1024,
  sonolusOptions: {
    version: '0.5.3',
    basePath: '',
    fallbackLocale: 'ja'
  }
}