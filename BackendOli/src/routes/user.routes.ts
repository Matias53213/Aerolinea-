import {Router} from 'express';
import {createUser, Gent} from '../controllers/user.controllers'

const router = Router();

router.post('/user', createUser)

router.get('/user', getUser)

export default router;
