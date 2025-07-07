import { Request, Response } from "express";
import { getUserByIdService, getAllUsers, loginUser, registerUser } from "../services/user.services";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await loginUser(email, password); 
    res.status(200).json(result);
  } catch (err: any) {
    res.status(401).json({ message: err.message });
  }
};

export const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body; 

  try {
    await registerUser(username, email, password); 
    res.status(201).json({ message: "Usuario creado" });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch {
    res.status(500).json({ message: "Usuarios no encontrados" });
  }
};

export const userId = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const user = await getUserByIdService(userId);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Usuario no encontrado" });
  }
};