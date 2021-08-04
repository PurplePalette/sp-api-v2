import multer from 'multer'
import path from 'path'
import { config } from '../config'
import { customAlphabet } from 'nanoid'

const acceptableMimeTypes = [
  'audio/mp3',
  'audio/mpeg',
  'application/gzip',
  'image/jpg',
  'image/jpeg',
  'image/png',
]
const nanoid = customAlphabet('123456789ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnpqrstuvwxyz', 20)

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (_, file, cb) {
    cb(null, nanoid() + path.extname(file.originalname))
  },
})

export const upload = multer({
  storage: storage,
  fileFilter: (_, file, cb) => {
    // Validate file extension
    if (!acceptableMimeTypes.includes(file.mimetype)) {
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
