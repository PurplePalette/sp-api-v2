import * as firebase from 'firebase-admin'
import { firebaseParams } from '../config'
import type { Request, Response, NextFunction } from 'express'

// Uncomment if using firebase auth emu
// process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'
// Uncomment if using firebase auth emu inside docker container
// process.env.FIREBASE_AUTH_EMULATOR_HOST = 'host.docker.internal:9099'

try {
  firebase.initializeApp({
    credential: firebase.credential.cert(firebaseParams),
  })
} catch (err) {
  console.log('Failed to initialize firebase, auth wont work.')
}

export async function verifyToken (idToken: string) : Promise<string> {
  const decodedToken = await firebase.auth().verifyIdToken(idToken)
  return decodedToken.uid
}

export function verifyAdmin (req: Request, res: Response, next: NextFunction) : void {
  if (!req.headers) {
    throw new Error('Headers are missing')
  }
  if (!req.headers.authorization) {
    throw new Error('Authorization header missing')
  }
  if (!req.headers.authorization.startsWith('Token ')) {
    throw new Error('Authorization must be token')
  }
  const token = req.headers.authorization.split(' ')[1]
  if (token != process.env.ADMIN_TOKEN) {
    res.status(401).json({
      error: new Error('Invalid request!')
    })
  } else {
    next()
  }
}

export function verifyUser (req: Request, res: Response, next: NextFunction) : void {
  try {
    if (!req.headers) {
      throw new Error('Headers are missing')
    }
    if (!req.headers.authorization) {
      throw new Error('Authorization header missing')
    }
    if (!req.headers.authorization.startsWith('Bearer ')) {
      throw new Error('Authorization must be bearer')
    }
    const token = req.headers.authorization.split(' ')[1]
    verifyToken(token).then(userId => {
      req.userId = userId
      next()
    }).catch(err => {
      console.log(err)
      res.status(401).json({
        error: new Error('Invalid request!')
      })
    })
  } catch {
    res.status(401).json({
      error: new Error('Invalid request!')
    })
  }
}