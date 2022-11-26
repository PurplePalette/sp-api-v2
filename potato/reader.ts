import fs from 'fs'
import { fromSus } from 'sonolus-pjsekai-engine'
import type { LevelInfo } from 'sonolus-express'
import { gzipSync } from 'zlib'
import { createHash } from 'crypto'
import CustomUserInfo from '../types/user'

/**
 * Generate SHA1 hash of a file
*/
function getHashFromFile(path: string): string {
  const file = fs.readFileSync(path)
  const hash = createHash('sha1').update(file).digest('hex')
  return hash
}

/**
 * Inject name/data/cover/bgm alternative to sonolus-generate-static
*/
function injectLackedFields(levelData: LevelInfo, levelName: string) {
  levelData.name = levelName
  levelData.data = {
    type: 'LevelData',
    // @ts-ignore
    hash: levelData.dataHash,
    url: `/repository/${levelName}/data.gz`
  }
  levelData.cover = {
    type: 'LevelCover',
    // @ts-ignore
    hash: levelData.coverHash,
    url: `/repository/${levelName}/cover.png`
  }
  levelData.bgm = {
    type: 'LevelBgm',
    // @ts-ignore
    hash: levelData.bgmHash,
    url: `/repository/${levelName}/bgm.mp3`
  }
  return levelData
}

/**
 * Load a level from a file.
 * If the level file is not customized level file, return undefined.
*/
function loadLevelInfo(levelName: string): LevelInfo | undefined {
  const levelData = JSON.parse(fs.readFileSync('./db/levels/' + levelName + '/info.json').toString()) as LevelInfo
  // @ts-ignore
  if (levelData.userId && levelData.coverHash) {
    return injectLackedFields(levelData, levelName)
  } else {
    return undefined
  }
}

/**
 * Load a original level file and cook the level to customized level file.
 * This function gzip level data, and create hash for the level files.
 * It may take some time.
*/
export function initLevelInfo(levelName: string): LevelInfo {
  const levelInfo = JSON.parse(fs.readFileSync(`./db/levels/${levelName}/info.json`).toString()) as LevelInfo
  const susData: string = fs.readFileSync(`./db/levels/${levelName}/data.sus`).toString()
  const levelData = JSON.stringify(fromSus(susData) as unknown as string)
  fs.writeFileSync(`./db/levels/${levelName}/data.json`, levelData)
  const levelDataGzip = gzipSync(fs.readFileSync(`./db/levels/${levelName}/data.json`).toString(), { level: 9 })
  fs.writeFileSync(`./db/levels/${levelName}/data.gz`, levelDataGzip)
  const levelDataHash = getHashFromFile(`./db/levels/${levelName}/data.gz`)
  const levelBgmHash = getHashFromFile(`./db/levels/${levelName}/bgm.mp3`)
  const levelCoverHash = getHashFromFile(`./db/levels/${levelName}/cover.png`)
  // @ts-ignore
  levelInfo.dataHash = levelDataHash
  // @ts-ignore
  levelInfo.bgmHash = levelBgmHash
  // @ts-ignore
  levelInfo.coverHash = levelCoverHash
  fs.writeFileSync(`./db/levels/${levelName}/info.json`, JSON.stringify(levelInfo, null, '    '))
  return injectLackedFields(levelInfo, levelName)
}

/**
 * Load db/levels folder and create levels database.
 * If found non-customized file(no hash exists in json) while loading, try to cook the level.
*/
export function initLevelsDatabase(): LevelInfo[] {
  console.log('Loading levels database...')
  const levels: LevelInfo[] = []
  const levelFolders = fs.readdirSync('./db/levels')
  for (const levelName of levelFolders) {
    if (levelName === '.gitkeep') {
      continue
    }
    try {
      const level = loadLevelInfo(levelName)
      if (level) {
        levels.push(level)
      }
      // } else {
      //  const newLevel = initLevelInfo(levelName)
      //  levels.push(newLevel)
      // }
    } catch (e) {
      console.error('Error reading level info file for ' + levelName)
      console.error(e)
    }
  }
  console.log('Loaded levels database successfully.')
  return levels
}

/**
 * Load db/users folder and create users database.
*/
export function initUsersDatabase(): CustomUserInfo[] {
  console.log('Loading users database...')
  const users: CustomUserInfo[] = []
  const userFolders = fs.readdirSync('./db/users')
  for (const userFile of userFolders) {
    if (userFile === '.gitkeep') {
      continue
    }
    try {
      const userData = JSON.parse(fs.readFileSync(`./db/users/${userFile}`).toString()) as CustomUserInfo
      users.push(userData)
    } catch (e) {
      console.error('Error reading user info file for ' + userFile)
    }
  }
  console.log('Loaded users database successfully.')
  return users
}
