import fs from 'fs'
import { Sonolus, LevelInfo, defaultListHandler } from 'sonolus-express'
import { customAlphabet } from 'nanoid'
import { initLevelInfo } from './reader'
import { config } from '../config'
import verifyUser from './auth'

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 12)

export function sortByUpdatedTime(levels: LevelInfo[]): LevelInfo[]{
  return levels.sort((n1: LevelInfo, n2: LevelInfo) => {
    if (n1.updatedTime < n2.updatedTime) {
      return 1
    }
    if (n1.updatedTime > n2.updatedTime) {
      return -1
    }
    return 0
  })
}

/**
 * Express: add/edit/delete level handler
*/
export function installLevelsEndpoints(sonolus: Sonolus): void {
  /* Server info */
  const publicLevels = sonolus.db.levels.filter(level => level.public === true)
  sonolus.serverInfoHandler = (sonolus) => {
    return {
      levels: sortByUpdatedTime(publicLevels).slice(0, 5),
      skins: sonolus.db.skins.slice(0, 5),
      backgrounds: sonolus.db.backgrounds.slice(0, 5),
      effects: sonolus.db.effects.slice(0, 5),
      particles: sonolus.db.particles.slice(0, 5),
      engines: sonolus.db.engines.slice(0, 5),
    }
  }

  /* List level */
  sonolus.levelListHandler = (sonolus, keywords, page) => {
    const publicLevels = sonolus.db.levels.filter(l => l.public === true)
    const resp = defaultListHandler(
      sortByUpdatedTime(publicLevels),
      ['name', 'rating', 'title', 'artists', 'author', 'description'],
      keywords,
      page
    )
    return resp
  }

  /* Add level */
  sonolus.app.post('/levels/:levelId', verifyUser, (req, res) => {
    const reqLevel = req.body as unknown as LevelInfo
    let levelName = nanoid()
    while (fs.existsSync(`./db/levels/${levelName}`)) {
      levelName = nanoid()
    }
    fs.mkdirSync(`./db/levels/${levelName}`)
    const now = new Date()
    const unixTime = Math.floor(now.getTime() / 1000)
    if (!req.userId) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }
    const newLevel: LevelInfo = {
      name: levelName,
      version: 1,
      rating: reqLevel.rating,
      engine: config.engine,
      useSkin: { useDefault: true },
      useBackground: { useDefault: true },
      useEffect: { useDefault: true },
      useParticle: { useDefault: true },
      title: reqLevel.title,
      artists: reqLevel.artists,
      author: reqLevel.author,
      genre: reqLevel.genre,
      public: false,
      userId: req.userId,
      notes: 0,
      createdTime: unixTime,
      updatedTime: unixTime,
      description: reqLevel.description,
      playCount: 0,
      coverHash: '',
      bgmHash: '',
      dataHash: '',
      cover: { type: 'LevelCover', hash: '', url: '' },
      bgm: { type: 'LevelBgm', hash: '', url: '' },
      data: { type: 'LevelData', hash: '', url: '' }
    }
    for (const file of [[reqLevel.cover.url, 'cover.png'], [reqLevel.bgm.url, 'bgm.mp3'], [reqLevel.data.url, 'data.json']]) {
      const separated = file[0].split('/')
      const fileName = separated[separated.length - 1]
      try {
        fs.renameSync(`./uploads/${fileName}`, `./db/levels/${levelName}/${file[1]}`)
      } catch (e) {
        fs.rmdirSync(`./db/levels/${levelName}`, { recursive: true })
        res.status(400).json({ message: 'Invalid file specified' })
        return
      }
    }
    fs.writeFileSync(`./db/levels/${levelName}/info.json`, JSON.stringify(newLevel, null, '    '))
    const levelInfo = initLevelInfo(levelName)
    sonolus.db.levels.push(levelInfo)
    res.json({ message: 'ok' })
  })

  /* Edit level */
  sonolus.app.patch('/levels/:levelName', verifyUser, (req, res) => {
    const reqLevel = req.body as unknown as LevelInfo
    const matchedLevel = sonolus.db.levels.filter(level => level.name === req.params.levelName)
    if (matchedLevel.length === 0) {
      res.json({ message: 'Level not found' })
      return
    }
    const oldLevel = matchedLevel[0]
    if (oldLevel.userId !== req.userId) {
      res.status(403).json({ message: 'You are not the author of this level' })
      return
    }
    const now = new Date()
    const unixTime = Math.floor(now.getTime() / 1000)
    const newLevel: LevelInfo = {
      name: oldLevel.name,
      version: 1,
      rating: reqLevel.rating,
      engine: config.engine,
      useSkin: { useDefault: true },
      useBackground: { useDefault: true },
      useEffect: { useDefault: true },
      useParticle: { useDefault: true },
      title: reqLevel.title,
      artists: reqLevel.artists,
      author: reqLevel.author,
      genre: reqLevel.genre,
      public: reqLevel.public,
      userId: req.userId,
      notes: 0,
      createdTime: oldLevel.createdTime,
      updatedTime: unixTime,
      description: reqLevel.description,
      playCount: oldLevel.playCount,
      coverHash: '',
      bgmHash: '',
      dataHash: '',
      cover: { type: 'LevelCover', hash: '', url: '' },
      bgm: { type: 'LevelBgm', hash: '', url: '' },
      data: { type: 'LevelData', hash: '', url: '' }
    }
    const levelName = oldLevel.name
    for (const file of [[reqLevel.cover.url, 'cover.png'], [reqLevel.bgm.url, 'bgm.mp3'], [reqLevel.data.url, 'data.json']]) {
      if (file[0].includes('uploads')) {
        const separated = file[0].split('/')
        const fileName = separated[separated.length - 1]
        try {
          fs.renameSync(`./uploads/${fileName}`, `./db/levels/${levelName}/${file[1]}`)
        } catch (e) {
          res.status(400).json({ message: 'Invalid file specified' })
          return
        }
      }
    }
    fs.writeFileSync(`./db/levels/${levelName}/info.json`, JSON.stringify(newLevel, null, '    '))
    const levelInfo = initLevelInfo(levelName)
    sonolus.db.levels = sonolus.db.levels.filter(level => level.name !== levelName)
    sonolus.db.levels.push(levelInfo)
    res.json({ message: 'ok' })
  })

  /* Delete level */
  sonolus.app.delete('/levels/:levelName', verifyUser, (req, res) => {
    const matchedLevel = sonolus.db.levels.filter(level => level.name === req.params.levelName)
    if (matchedLevel.length === 0) {
      res.status(404).json({ message: 'Level not found' })
      return
    }
    if (matchedLevel[0].userId !== req.userId) {
      res.status(403).json({ message: 'You are not the author of this level' })
      return
    }
    fs.rmdirSync(`./db/levels/${req.params.levelName}`, { recursive: true })
    sonolus.db.levels = sonolus.db.levels.filter(level => level.name !== req.params.levelName)
    res.json({ message: 'ok' })
  })
}