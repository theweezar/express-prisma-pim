import 'dotenv/config'
import express from 'express'
import SystemEntityMgr from './pkg/system/systemEntityMgr'
import { SystemEntityType } from '../prisma/generated/enums'
import { toEntityDetail, toEntityOnForm } from './pkg/system/models/adapter'

const app = express()

app.use(express.json())

app.get(`/`, (req, res) => {
  res.send('Hello world!')
})

app.get(`/product/:value`, async (req, res) => {
  const { value } = req.params
  const product = await SystemEntityMgr.getSystemEntityByPrimary(SystemEntityType.PRODUCT, value)
  const groups = await SystemEntityMgr.getGroupsJoinAssignmentsByEntityType(SystemEntityType.PRODUCT)
  if (product) {
    // const productJson = toEntityDetail(product);
    const productJson = toEntityOnForm(product, groups);
    res.json(productJson)
  } else {
    res.json({ notFound: true })
  }
})

const server = app.listen(3000, () =>
  console.log(`
🚀 Server ready at: http://localhost:3000
⭐️ See sample requests: https://github.com/prisma/prisma-examples/blob/latest/orm/express/README.md#using-the-rest-api`),
)
