import express from 'express'
import { initLevelInfo } from './reader'
import CustomLevelInfo from '../types/level'
import * as OpenApiValidator from 'express-openapi-validator'
import type { NextFunction, Request, Response } from 'express'
import { customAlphabet } from 'nanoid'
import fs from 'fs'
import { config } from '../config'
import authMiddleware from './auth'

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 12)

/**
 * Express: add/edit/delete level handler
*/
export const levelsRouter = express.Router()

// Default handling is json
levelsRouter.use(express.json())

// Add firebase auth middleware
//levelsRouter.use(authMiddleware)

// Add validator
levelsRouter.use(
  OpenApiValidator.middleware({
    apiSpec: './api.yaml',
    validateRequests: {
      removeAdditional: 'all'
    }
  }),
)

// I couldn't found express-opeapi-validator-error type
interface OpenApiError {
  status?: number
  errors?: string
  message?: string
}

// Default error handler
levelsRouter.use((
  err: OpenApiError,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  })
})

levelsRouter.post('/:levelId', (req, res) => {
  const reqLevel = req.body as unknown as CustomLevelInfo
  let levelName = nanoid()
  while (fs.existsSync(`./db/levels/${levelName}`)) {
    levelName = nanoid()
  }
  fs.mkdirSync(`./db/levels/${levelName}`)
  const now = new Date()
  const unixTime = Math.floor(now.getTime() / 1000)
  const newLevel: CustomLevelInfo = {
    name: levelName,
    version: 1,
    rating: reqLevel.rating,
    engine: config.engine,
    useSkin: {
      useDefault: true,
    },
    useBackground: {
      useDefault: true,
    },
    useEffect: {
      useDefault: true,
    },
    useParticle: {
      useDefault: true,
    },
    title: reqLevel.title,
    artists: reqLevel.artists,
    author: reqLevel.author,
    genre: reqLevel.genre,
    public: false,
    userId: 'TODO',
    notes: 0,
    createdTime: unixTime,
    updatedTime: unixTime,
    description: reqLevel.description,
    playCount: 0,
    coverHash: '',
    bgmHash: '',
    dataHash: '',
    cover: {
      type: 'LevelCover',
      hash: '',
      url: ''
    },
    bgm: {
      type: 'LevelBgm',
      hash: '',
      url: ''
    },
    data: {
      type: 'LevelData',
      hash: '',
      url: ''
    }
  }
  for (const file of [[reqLevel.cover.url, 'cover.png'], [reqLevel.bgm.url, 'bgm.mp3'], [reqLevel.data.url, 'data.json']]) {
    const separated = file[0].split('/')
    const fileName = separated[separated.length - 1].replace('.', '')
    try {
      fs.renameSync(`./uploads/${fileName}`, `./db/levels/${levelName}/${file[1]}`)
    } catch (e) {
      fs.rmdirSync(`./db/levels/${levelName}`, { recursive: true })
      res.json({ message: 'Invalid file specified' })
      return
    }
  }
  fs.writeFileSync(`./db/levels/${levelName}/info.json`, JSON.stringify(newLevel, null, '    '))
  const levelInfo = initLevelInfo(levelName)
  const levels = req.app.locals.levels as CustomLevelInfo[]
  levels.push(levelInfo)
  req.app.set('levels', levels)
  res.json({ message: 'ok' })
})

levelsRouter.patch('/:levelName', (req, res) => {
  const reqLevel = req.body as unknown as CustomLevelInfo
  let levels = req.app.locals.levels as CustomLevelInfo[]
  const matchedLevel = levels.filter(level => level.name === req.params.levelName)
  if (matchedLevel.length === 0) {
    res.json({ message: 'Level not found' })
    return
  }
  const oldLevel = matchedLevel[0]
  const now = new Date()
  const unixTime = Math.floor(now.getTime() / 1000)
  const newLevel: CustomLevelInfo = {
    name: oldLevel.name,
    version: 1,
    rating: reqLevel.rating,
    engine: config.engine,
    useSkin: {
      useDefault: true,
    },
    useBackground: {
      useDefault: true,
    },
    useEffect: {
      useDefault: true,
    },
    useParticle: {
      useDefault: true,
    },
    title: reqLevel.title,
    artists: reqLevel.artists,
    author: reqLevel.author,
    genre: reqLevel.genre,
    public: reqLevel.public,
    userId: 'TODO',
    notes: 0,
    createdTime: oldLevel.createdTime,
    updatedTime: unixTime,
    description: reqLevel.description,
    playCount: oldLevel.playCount,
    coverHash: '',
    bgmHash: '',
    dataHash: '',
    cover: {
      type: 'LevelCover',
      hash: '',
      url: ''
    },
    bgm: {
      type: 'LevelBgm',
      hash: '',
      url: ''
    },
    data: {
      type: 'LevelData',
      hash: '',
      url: ''
    }
  }
  const levelName = oldLevel.name
  for (const file of [[reqLevel.cover.url, 'cover.png'], [reqLevel.bgm.url, 'bgm.mp3'], [reqLevel.data.url, 'data.json']]) {
    if (file[0].includes('uploads')) {
      const separated = file[0].split('/')
      const fileName = separated[separated.length - 1].replace('.', '')
      try {
        fs.renameSync(`./uploads/${fileName}`, `./db/levels/${levelName}/${file[1]}`)
      } catch (e) {
        res.json({ message: 'Invalid file specified' })
        return
      }
    }
  }
  fs.writeFileSync(`./db/levels/${levelName}/info.json`, JSON.stringify(newLevel, null, '    '))
  const levelInfo = initLevelInfo(levelName)
  levels = levels.filter(level => level.name !== levelName)
  levels.push(levelInfo)
  res.json({ message: 'ok' })
})

levelsRouter.delete('/:levelId', (req, res) => {
  req.params.levelId
  res.send('Hello.')
})