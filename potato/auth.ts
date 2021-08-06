import * as firebase from 'firebase-admin'
import { firebaseParams } from '../config'
import type { NextFunction, Request, Response } from 'express'

firebase.initializeApp({
  credential: firebase.credential.cert(firebaseParams),
})

export async function verifyToken (idToken: string) : Promise<string> {
  const decodedToken = await firebase.auth().verifyIdToken(idToken)
  return decodedToken.uid
}

export default async function authMiddleware (req: Request, res: Response, next: NextFunction) : Promise<void> {
  try {
    if (!req.headers) {
      throw new Error('header missing')
    }
    if (!req.headers.authorization) {
      throw new Error('Authorization header missing')
    }
    if (!req.headers.authorization.startsWith('Bearer ')) {
      throw new Error('Authorization must be bearer')
    }
    const token = req.headers.authorization.split(' ')[1]
    const userId = await verifyToken(token)
    if (userId) {
      req.userId = userId
      next()
    }
  } catch {
    res.status(401).json({
      error: new Error('Invalid request!')
    })
  }
}