import { Request, Response } from "express";
import { getAllUsersService, getUserByIdService } from "../services/user.services";

export const getAll = async (req:Request, res:Response)=>{
    try {
        const users = await getAllUsersService()
        res.status(200).json(users)
    } catch (error) {
        res.status(500).json({message: "Usuario no encontrados"})
    }
}

export const userId = async(req:Request, res:Response)=>{
    const {userId} = req.params;
    try {
        const user = await getUserByIdService(userId)
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({message: "Usuario no encontrado"})
    }
}