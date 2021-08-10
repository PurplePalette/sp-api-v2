import {
  Sonolus,
  defaultListHandler, listRouteHandler,
  LevelInfo, toLevelItem, LocalizationText
} from 'sonolus-express'
import { sortByUpdatedTime } from './levels'
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
  sonolus.app.get('/users/:userId/levels', verifyUser, (req, res, next) => {
    (async () => {
      req.localize = (text: LocalizationText) => sonolus.localize(text, req.query.localization as string)
      let matchedLevels = sonolus.db.levels.filter(level => level.userId === req.params.userId)
      if (req.params.userId == req.userId) {
        const testingLevels = req.app.locals.tests as LevelInfo[]
        const filteredLevels = testingLevels.filter(l => l.userId === req.params.userId)
        matchedLevels = matchedLevels.concat(filteredLevels)
      }
      if (matchedLevels.length === 0) { return }
      const userLevelListHandler = (
        sonolus: Sonolus,
        keywords: string | undefined,
        page: number
      ): {
        pageCount: number
        infos: LevelInfo[]
      } => {
        return defaultListHandler(
          sortByUpdatedTime(matchedLevels),
          ['name', 'rating', 'title', 'artists', 'author', 'description'],
          keywords,
          page
        )
      }
      await listRouteHandler(sonolus, userLevelListHandler, toLevelItem, req, res)
    })().catch(next)
  })
}
