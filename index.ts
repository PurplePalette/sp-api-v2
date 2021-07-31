import express from 'express'
// import { Sonolus } from 'sonolus-express'

const port: number = 3000
const app: express.Express = express()

// new Sonolus(app).load('pack')

app.get('/', (req: express.Request, res: express.Response) => {
    res.send('Hello express.ts world')
})

app.listen(port, () => {
    console.log('Server listening at port', port)
})