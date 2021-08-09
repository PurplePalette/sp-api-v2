import express from 'express'
import { Sonolus, EngineInfo } from 'sonolus-express'
import { config } from './config'
import { uploadRouter } from './potato/upload'
import { usersRouter } from './potato/users'
import { initLevelsDatabase, initUsersDatabase } from './potato/reader'
import { levelsRouter } from './potato/levels'
import { createTestsRouter } from './potato/tests'
import * as OpenApiValidator from 'express-openapi-validator'
import type { NextFunction, Request, Response } from 'express'
import CustomLevelInfo from './types/level'

/*
 * Sonolus-uploader-core-2 Main class
 *
 * Startup sonolus server and listen for uploads.
 * This app uses port 3000.
*/

const app = express()

// Inject uploadRouter
app.use('/', uploadRouter)

// Inject levelsRouter
app.use('/levels', levelsRouter)

// Inject usersRouter
app.use('/users', usersRouter)

// Set levels to express.js global (not recommended...)
app.locals.levels = initLevelsDatabase()
app.locals.users = initUsersDatabase()

// Inject sonolus-express
const potato = new Sonolus(app, config.sonolusOptions)
potato.db.levels = app.locals.levels as CustomLevelInfo[]

// Inject testsRouter
app.use('/tests', createTestsRouter(potato))

// Add static folder (for use with sonolus-server-landing)
app.use('/', express.static(config.static))

// Add Open-API Spec
app.use('/spec', express.static('./api.yaml'))

// Add static folder (for use with upload)
app.use('/repository/', express.static('./db/levels/'))

// Load sonolus-pack folder
try {
  potato.load(config.packer)
} catch (e) {
  console.log('Sonolus-packer db was not valid!')
}

const defaultEngine : EngineInfo = potato.db.engines.filter(engine => engine.name === config.engine)[0]
app.locals.defaultEngine = defaultEngine

// Startup the server
app.listen(config.port, () => {
  console.log('Server listening at port', config.port)
})
