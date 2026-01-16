import 'dotenv/config'
import express from 'express'
import SystemEntityMgr from './pkg/system/SystemEntityMgr'
import { SystemEntityType } from '../prisma/generated/enums'

const app = express()

app.use(express.json())

app.get(`/`, (req, res) => {
  res.send('Hello world!')
})

app.get(`/entity/:type/:uuid`, async (req, res) => {
  const { type, uuid } = req.params
  const entity = await SystemEntityMgr.getSystemEntity(type as SystemEntityType, uuid)
  res.json(entity)
})

app.get(`/product/:uuid`, async (req, res) => {
  const { uuid } = req.params
  const product = await SystemEntityMgr.getSystemEntity(SystemEntityType.PRODUCT, uuid)
  res.json(product)
})

app.get(`/primary/product/:value`, async (req, res) => {
  const { value } = req.params
  const product = await SystemEntityMgr.getSystemEntityByPrimary(
    SystemEntityType.PRODUCT, value
  )
  res.json(product)
})

const server = app.listen(3000, () =>
  console.log(`
🚀 Server ready at: http://localhost:3000
⭐️ See sample requests: https://github.com/prisma/prisma-examples/blob/latest/orm/express/README.md#using-the-rest-api`),
)
