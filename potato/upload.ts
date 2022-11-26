import { Sonolus } from 'sonolus-express'
import multer from 'multer'
import path from 'path'
import { config } from '../config'
import { customAlphabet } from 'nanoid'
import { verifyUser } from './auth'

const nanoid = customAlphabet('123456789ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnpqrstuvwxyz', 20)

const acceptableMimeTypes = [
  'text/plain',
  'audio/mp3',
  'audio/mpeg',
  'image/jpg',
  'image/jpeg',
  'image/png',
]

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, config.uploads)
  },
  filename: function (_, file, cb) {
    cb(null, nanoid() + path.extname(file.originalname))
  },
})

const upload = multer({
  storage: storage,
  fileFilter: (_, file, cb) => {
    // Validate file extension
    if (!acceptableMimeTypes.includes(file.mimetype) && path.extname(file.originalname) !== '.sus') {
      // cb null,False denies upload
      cb(null, false)
      // cb error return text response
      return cb(new Error('Only .gz, .mp3 .png, .jpg and .jpeg format allowed!'))
    }
    // cb null,True allows upload
    cb(null, true)
  },
  limits: {
    fileSize: config.maxSize,
    fields: 5,
    fieldNameSize: 50
  },
}).single('file')

export function installUploadEndpoints (sonolus: Sonolus) : void {
  // Receive file upload
  sonolus.app.post('/upload', verifyUser, (req, res) => {
    upload(req, res, function (err) {
      if (err || !req.file) {
        res.status(400).json({ message: 'File validation failed.' })
      } else {
        res.status(200).json({ message: 'File saved.', filename: req.file.filename })
      }
    })
  })
}
