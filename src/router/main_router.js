import { Router } from "express";
import { isBlocked } from "../controller/clo_controller.js";



const router = Router()

router.get('/api', isBlocked)

export default router