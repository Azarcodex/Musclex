import express from 'express'
import { googleAuth } from '../controllers/googleAuth/auth.js'
const router=express.Router()

router.post("/google",googleAuth)
export default router