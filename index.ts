import express from 'express'
import { Sonolus } from 'sonolus-express'
import { config } from './config'
import { uploadRouter } from './potato/upload'

/*
 * Sonolus-uploader-core-2 Main class
 *
 * Startup sonolus server and listen for uploads.
 * This app uses port 3000.
*/

const app = express()

// Inject sonolus-express
const potato = new Sonolus(app, config.sonolusOptions)

// Inject uploadRouter
app.use('/', uploadRouter)

// Add static folder (for use with sonolus-server-landing)
app.use('/', express.static(config.static))

// Add static folder (for use with upload)
app.use('/repository/', express.static(config.uploads))

// Add static folder (for use with sonolus-pack)
app.use('/', express.static(config.packer))

// Load uploads folder (for use with sonolus-pack)
try {
  potato.load(config.packer)
} catch (e) {
  console.log('Sonolus-packer db was not valid!')
}

// Startup the server
app.listen(config.port, () => {
  console.log('Server listening at port', config.port)
})
