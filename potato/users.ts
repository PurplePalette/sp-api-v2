import { Sonolus } from 'sonolus-express'
import CustomUserInfo from '../types/user'
import verifyUser from './auth'

export function installUsersEndpoints(sonolus: Sonolus): void {
  // Get user detail
  sonolus.app.get('/users/:userId', (req, res) => {
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
  sonolus.app.patch('/users/:userId', verifyUser, (req, res) => {
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
  sonolus.app.get('/users/:userId/levels', verifyUser, (req, res) => {
    let matchedLevels = sonolus.db.levels.filter(level => level.userId === req.params.userId)
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
}
