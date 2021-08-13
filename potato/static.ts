import express from 'express'
import { Sonolus } from 'sonolus-express'
import { config } from '../config'

export function installStaticEndpoints (sonolus: Sonolus) : void {
  // Add static folder (for use with sonolus-server-landing)
  sonolus.app.use('/', express.static(config.static))

  // Add Open-API Spec
  sonolus.app.use('/spec', express.static('./api.yaml'))

  // Add static folder (for use with upload)
  sonolus.app.use('/repository/', express.static('./db/levels/'))

  sonolus.app.use('/users/:userId/repository/', express.static('./db/levels/'))

  sonolus.app.use('/tests/:testId/repository/', express.static('./db/levels/'))
}
