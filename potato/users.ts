import {
  Sonolus,
  defaultListHandler, listRouteHandler,
  detailsRouteHandler,
  toServerInfo,
  LevelInfo, toLevelItem, LocalizationText
} from 'sonolus-express'
import type { Request } from 'express'
import { sortByUpdatedTime } from './levels'
import CustomUserInfo from '../types/user'
import verifyUser from './auth'
import fs from 'fs'

function getUsersLevels (sonolus: Sonolus, req: Request) : LevelInfo[] {
  let matchedLevels = sonolus.db.levels.filter(level => level.userId === req.params.userId)
  if (req.params.userId !== req.userId) {
    matchedLevels = matchedLevels.filter(level => level.public === true)
  }
  if (matchedLevels.length === 0) {
    return []
  }
  return matchedLevels
}

export function installUsersEndpoints(sonolus: Sonolus): void {
  // User server info
  sonolus.app.get('/users/:userId/info', (req, res) => {
    req.localize = (text: LocalizationText) => sonolus.localize(text, req.query.localization as string)
    const filteredLevels = sortByUpdatedTime(getUsersLevels(sonolus, req))
    if (filteredLevels.length === 0) { return res.status(404).json({message: 'No user found'})}
    res.json(
      toServerInfo(
        {
          levels: filteredLevels.slice(0, 5),
          skins: [], backgrounds: [], effects: [], particles: [], engines: []
        },
        sonolus.db,
        req.localize
      )
    )
  })

  // Get user detail
  sonolus.app.get('/users/:userId', verifyUser, (req, res) => {
    const users = req.app.locals.users as CustomUserInfo[]
    const matchedUser = users.filter(user => user.userId === req.params.userId)
    if (matchedUser.length === 0) {
      res.status(404).json({ message: 'User not found' })
      return
    }
    const resp = matchedUser[0]
    if (req.params.userId != req.userId) {
      resp.testId = 'hidden'
    }
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
    req.app.locals.users = users
    fs.writeFileSync(`./db/users/${reqUser.userId}.json`, JSON.stringify(reqUser, null, '    '))
    res.json({ message: 'User edit success' })
  })

  // Get user detail
  sonolus.app.get('/users/:userId/levels/list', verifyUser, (req, res, next) => {
    (async () => {
      req.localize = (text: LocalizationText) => sonolus.localize(text, req.query.localization as string)
      const userLevelListHandler = (
        sonolus: Sonolus,
        keywords: string | undefined,
        page: number
      ): {
        pageCount: number
        infos: LevelInfo[]
      } => {
        return defaultListHandler(
          sortByUpdatedTime(getUsersLevels(sonolus, req)),
          ['name', 'rating', 'title', 'artists', 'author', 'description'],
          keywords,
          page
        )
      }
      await listRouteHandler(sonolus, userLevelListHandler, toLevelItem, req, res)
    })().catch(next)
  })

  /* Get level */
  sonolus.app.get('/users/:userId/levels/:name', (req, res, next) => {
    (async () => {
      req.localize = (text: LocalizationText) => sonolus.localize(text, req.query.localization as string)
      await detailsRouteHandler(sonolus, sonolus.levelDetailsHandler, toLevelItem, req, res)
    })().catch(next)
  })
}
