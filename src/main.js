import express from 'express'
import cors from 'cors'
import router from './router/main_router.js'


const main = () => {
  const app = express()
  app.use(cors())
  app.use(express.json())

  const PORT = 3000

  app.use('/', router)

  app.listen(PORT, () => {
    console.log('Server running')
  })
}

main()