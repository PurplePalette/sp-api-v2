import express from 'express'
import { Sonolus } from 'sonolus-express'
import { config } from './config'
import { uploadRouter } from './potato/upload'
import { levelsRouter, customLevelListHandler, customLevelDetailsHandler } from './potato/levels'

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

// Inject sonolus-express
const potato = new Sonolus(app, config.sonolusOptions)
potato.levelListHandler = customLevelListHandler
potato.levelDetailsHandler = customLevelDetailsHandler

// Add static folder (for use with sonolus-server-landing)
app.use('/', express.static(config.static))

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
