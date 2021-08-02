import express from 'express'
import fs from 'fs'
import { Sonolus } from 'sonolus-express'

/*
 * Sonolus-uploader-core-2 Main class
 *
 * Startup sonolus server and listen for uploads.
 * This app uses port 3000.
*/

const app  = express()
const port = 3000
const staticFolder = './public'
const uploadFolder = './uploads'
const options = {
    version: '0.5.3',
    // This param specifies endpoint.
    // Ex. If specify /api, you access with http://localhost:3000/api
    basePath: '',
    fallbackLocale: 'ja'
}

// Inject sonolus-express
const potato = new Sonolus(app, options)

// Add static folder (for use with sonolus-server-landing)
app.use('/', express.static(staticFolder))

// Load uploads folder (for use with sonolus-pack)
if (fs.existsSync(uploadFolder)) {
    try {
        potato.load(uploadFolder)
    } catch (e) {
        console.log('Database was not valid...')
    }
} else {
    console.log(`${uploadFolder} folder was not exist.`)
    fs.mkdirSync(uploadFolder)
}

// Startup the server
app.listen(port, () => {
    console.log('Server listening at port', port)
})
