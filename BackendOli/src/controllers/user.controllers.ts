import { Request, Response } from "express";
import {
  getUserByIdService,
  getAllUsers,
  deleteUserByIdService,
  updateUserService,
  loginUser,
  registerUser,
} from "../services/user.services";

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

export const getAll = async (_: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch {
    res.status(500).json({ message: "Usuarios no encontrados" });
  }
};

export const userId = async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  try {
    const user = await getUserByIdService(userId);
    res.status(200).json(user);
  } catch {
    res.status(500).json({ message: "Usuario no encontrado" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    await deleteUserByIdService(parseInt(userId));
    res.status(200).json({ message: "Usuario eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el usuario" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { username, email } = req.body;

  try {
    const user = await updateUserService(parseInt(userId), username, email);
    res.status(200).json(user);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};