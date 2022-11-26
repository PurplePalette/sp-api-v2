import express from 'express'
import logger from 'morgan'
import cors from 'cors'
import { Sonolus } from 'sonolus-express'
import { initLevelsDatabase, initUsersDatabase } from './potato/reader'
import { installUploadEndpoints } from './potato/upload'
import { installStaticEndpoints } from './potato/static'
import { installLevelsEndpoints } from './potato/levels'
import { installTestsEndpoints } from './potato/tests'
import { installUsersEndpoints } from './potato/users'
import { installSekaiEngine } from './potato/engine'
import { config } from './config'

/*
 * Sonolus-uploader-core-2 Main class
 *
 * Startup sonolus server and listen for uploads.
 * This app uses port 3000.
*/

const app = express()

// Add logger
app.use(logger('tiny'))

// Add CORS support
app.use(cors({
  origin: ['https://potato.purplepalette.net', 'https://potato-next.purplepalette.net', 'https://potato-dev.purplepalette.net', 'http://localhost:8080'],
  optionsSuccessStatus: 200
}))

// Set up body parsers.
// This is required to use OpenApiValidator
app.use(express.json())
app.use(express.text())
app.use(express.urlencoded({ extended: false }))

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
// Inject sekai-engine
installSekaiEngine(potato)

// Load sonolus-pack folder
try {
  potato.load(config.packer)
} catch (e) {
  console.log(e)
  console.log('Sonolus-packer db was not valid!')
}

// Adjust sonolus-packed level to custom level
for (let i = 0; i < potato.db.levels.length; i++) {
  potato.db.levels[i].public = true
  potato.db.levels[i].userId = 'admin'
  potato.db.levels[i].createdTime = 1
  potato.db.levels[i].updatedTime = 1
}

// Load database
potato.db.levels = potato.db.levels.concat(initLevelsDatabase())
app.locals.users = initUsersDatabase()

// Inject custom endpoints
installStaticEndpoints(potato)
installLevelsEndpoints(potato)
installTestsEndpoints(potato)
installUsersEndpoints(potato)
installUploadEndpoints(potato)

// Startup the server
app.listen(config.port, () => {
  console.log('Server listening at port', config.port)
})
