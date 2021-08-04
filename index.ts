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

// Receive file upload
app.post('/upload', (req, res) => {
  upload(req, res, function (err) {
    // This upload handler needs mimetype and filename
    // If request from python with just binary, it return success but don't save file.
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      console.log(err)
      res.status(400)
      res.send('Requested file was not valid.')
    } else if (err) {
      // An unknown error occurred when uploading.
      res.send(err)
      res.status(500)
      res.send('Internal server error. Please try again.')
    }
    res.send('File saved.')
  })
})

// Startup the server
app.listen(config.port, () => {
  console.log('Server listening at port', config.port)
})
