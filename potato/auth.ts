import * as firebase from 'firebase-admin'
import { firebaseParams } from '../config'
import type { Request, Response, NextFunction } from 'express'

// Uncomment if using firebase auth
// process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'

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

export default function verifyUser (req: Request, res: Response, next: NextFunction) : void {
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