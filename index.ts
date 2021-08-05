import express from 'express'
import { Sonolus } from 'sonolus-express'
import { config } from './config'
import { uploadRouter } from './potato/upload'
<<<<<<< HEAD
import { usersRouter } from './potato/users'
import { levelsRouter, customLevelListHandler, customLevelDetailsHandler } from './potato/levels'
=======
import { initLevelsDatabase } from './potato/reader'
import { levelsRouter } from './potato/levels'
import CustomLevelInfo from './types/level'
>>>>>>> 84519eb119d742911611d68ffbd16e4421280d65

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

<<<<<<< HEAD
// Inject usersRouter
app.use('/users', usersRouter)
=======
// Set levels to express.js global (not recommended...)
app.locals.levels = initLevelsDatabase()
>>>>>>> 84519eb119d742911611d68ffbd16e4421280d65

// Inject sonolus-express
const potato = new Sonolus(app, config.sonolusOptions)
potato.db.levels = app.locals.levels as CustomLevelInfo[]

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

// Startup the server
app.listen(config.port, () => {
  console.log('Server listening at port', config.port)
})
