import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import CustomUserInfo from '../types/user'
import CustomLevelInfo from '../types/level'
import * as OpenApiValidator from 'express-openapi-validator'

/**
 * Express: add/edit/get account handler
*/
export const usersRouter = express.Router()

// Default handling is json
usersRouter.use(express.json())

// Add validator
usersRouter.use(
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
usersRouter.use((
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

// Per-user level list
usersRouter.get('/:userId/levels/list', (req, res) => {
  const users = req.app.locals.users as CustomUserInfo[]
  const levels = req.app.locals.levels as CustomLevelInfo[]
  const matchedUser = users.filter(user => user.userId === req.params.userId)
  if (matchedUser.length === 0) {
    res.json({ message: 'User not found' })
    return
  }
  const userLevels = levels.filter(level => level.userId === req.params.userId)
  const lang = req.query.localization ? req.query.localization.toString() : 'ja'
  const respLevels: any[] = userLevels.map(level => {
    return {
      name: level.name,
      title: level.title[lang],
      artists: level.artists[lang],
      author: level.author[lang],
      version: level.version,
      rating: level.rating,
      description: level.description[lang],
      createdTime: level.createdTime,
      updatedTime: level.updatedTime,
      cover: level.cover,
      bgm: level.bgm,
      data: level.data,
    }
  })
  /// How to solve EngineData to EngineInfo...?
  res.json(respLevels)
})

// Get user detail
usersRouter.get('/:userId', (req, res) => {
  const users = req.app.locals.users as CustomUserInfo[]
  const matchedUser = users.filter(user => user.userId === req.params.userId)
  if (matchedUser.length === 0) {
    res.json({ message: 'User not found' })
    return
  }
  const resp = matchedUser[0]
  resp.testId = 'hidden'
  res.json(resp)
})

// Edit user detail
usersRouter.patch('/:userId', (req, res) => {
  let users = req.app.locals.users as CustomUserInfo[]
  const reqUser = req.body as unknown as CustomUserInfo
  const matchedUser = users.filter(user => user.userId === req.params.userId)
  if (matchedUser.length === 0) {
    users.push(reqUser)
    res.json({ message: 'User add success' })
    return
  }
  users = users.filter(user => user.userId !== reqUser.userId)
  users.push(reqUser)
  req.app.locals.users = users
  res.json({ message: 'User edit success' })
})