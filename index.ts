import express from 'express'
import * as OpenApiValidator from 'express-openapi-validator'
import { Sonolus } from 'sonolus-express'
import { initLevelsDatabase, initUsersDatabase } from './potato/reader'
import { installUploadEndpoints } from './potato/upload'
import { installStaticEndpoints } from './potato/static'
import { installLevelsEndpoints } from './potato/levels'
import { installTestsEndpoints } from './potato/tests'
import { installUsersEndpoints } from './potato/users'
import { config } from './config'

/*
 * Sonolus-uploader-core-2 Main class
 *
 * Startup sonolus server and listen for uploads.
 * This app uses port 3000.
*/

const app = express()

// Add validator
app.use(
  OpenApiValidator.middleware({
    apiSpec: './api.yaml',
    validateRequests: { removeAdditional: 'all' }
  }),
)
app.use((
  err: { status?: number, errors?: string, message?: string },
  req: express.Request, res: express.Response, next: express.NextFunction
) => {
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  })
})

// Install sonolus-express
const potato = new Sonolus(app, config.sonolusOptions)
// Load database
const levels = initLevelsDatabase()
potato.db.levels = levels.filter(l => l.public === true)
app.locals.tests = levels.filter(l => l.public === false)
app.locals.users = initUsersDatabase()

// Inject custom endpoints
installLevelsEndpoints(potato)
installTestsEndpoints(potato)
installUsersEndpoints(potato)
installUploadEndpoints(potato)
installStaticEndpoints(potato)

// Load sonolus-pack folder
try {
  potato.load(config.packer)
} catch (e) {
  console.log('Sonolus-packer db was not valid!')
}

// Startup the server
app.listen(config.port, () => {
  console.log('Server listening at port', config.port)
})
