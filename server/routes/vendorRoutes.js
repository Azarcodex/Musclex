import express from 'express'
import { loginVendor, registerVendor } from '../controllers/vendor/authController.js'
const router=express.Router()

router.post("/register",registerVendor)
router.post("/login",loginVendor)
export default router