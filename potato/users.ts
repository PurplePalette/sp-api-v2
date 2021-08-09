import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import CustomUserInfo from '../types/user'
import CustomLevelInfo from '../types/level'
import verifyUser from './auth'
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

// I couldn't found express-openapi-validator-error type
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
usersRouter.patch('/:userId', verifyUser, (req, res) => {
  if (req.params.userId != req.userId) {
    return res.status(403).json({ message: 'Permission denied' })
  }
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
  req.app.set('users', users)
  res.json({ message: 'User edit success' })
})

// Get user detail
usersRouter.get('/:userId/levels', verifyUser, (req, res) => {
  const levels = req.app.locals.levels as CustomLevelInfo[]
  let matchedLevels = levels.filter(level => level.userId === req.params.userId)
  if (req.params.userId != req.userId) {
    matchedLevels = matchedLevels.filter(level => level.public === true)
  }
  const page = req.query.page ? parseInt(req.query.page as string) : 0
  const perPage = 4
  res.json({
    pageCount: Math.ceil(matchedLevels.length / perPage),
    items: matchedLevels.slice(page * perPage, (page + 1) * perPage),
  })
})