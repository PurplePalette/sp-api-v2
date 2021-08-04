import express from 'express'
import multer from 'multer'
import { Sonolus } from 'sonolus-express'
import { config } from './config'
import { upload } from './potato/upload'

/*
 * Sonolus-uploader-core-2 Main class
 *
 * Startup sonolus server and listen for uploads.
 * This app uses port 3000.
*/

const app = express()

// Inject sonolus-express
const potato = new Sonolus(app, config.sonolusOptions)

// Add static folder (for use with sonolus-server-landing)
app.use('/', express.static(config.static))

// Add static folder (for use with sonolus-pack)
app.use('/', express.static(config.packer))

// Add static folder (for use with upload)
app.use('/repository/', express.static(config.uploads))

// Load packer folder (for use with sonolus-pack)
try {
  potato.load(config.packer)
} catch (e) {
  console.log('Sonolus-packer db was not valid!')
}

// Startup the server
app.listen(config.port, () => {
  console.log('Server listening at port', config.port)
})
