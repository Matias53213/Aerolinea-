import {Request, Response} from 'express'
import {User} from '../entities/user'
import { userInfo } from 'os'

export const createUser = async (req: Request, res: Response) => {
    const {firstname, lastname} = req.body

    const user = new User()
    user.firstname = firstname
    user.lastname = lastname

    await user.save()

    console.log(user)

    res.send('hello world')
}