import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../entities/user";
import { AppDataSource } from "../dbconfig/db";
import UserRepository from "../repositories/user.repository";

const userRepo = AppDataSource.getRepository(User);

export const loginUser = async (email: string, password: string) => {
  const user = await userRepo.findOneBy({ email });
  if (!user) throw new Error("Usuario no encontrado");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Contraseña incorrecta");

  const token = jwt.sign({ id: user.id }, "secreto", { expiresIn: "1h" });
  return { token, user };
};

export const registerUser = async (username: string, email: string, password: string) => {
  const existingEmail = await userRepo.findOneBy({ email });
  const existingUsername = await userRepo.findOneBy({ username });

  if (existingEmail) throw new Error("Ya existe un usuario con ese email");
  if (existingUsername) throw new Error("Ya existe un usuario con ese nombre");

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = userRepo.create({
    username,
    email,
    password: hashedPassword
  });

  await userRepo.save(newUser);
};

export const getUserByIdService = async (id: number): Promise<User> => {
  try {
    const user = await UserRepository.findById(id);
    return user;
  } catch (error) {
    throw error;
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const users = await UserRepository.findAllUser();
    return users;
  } catch (error) {
    throw error;
  }
};
export const updateUserService = async (id: number, username: string, email: string): Promise<User> => {
  const user = await userRepo.findOneBy({ id });
  if (!user) throw new Error("Usuario no encontrado");

  user.username = username;
  user.email = email;

  return await userRepo.save(user);
};

export const deleteUserByIdService = async (id: number): Promise<void> => {
  const user = await userRepo.findOneBy({ id });
  if (!user) throw new Error("Usuario no encontrado");

  await userRepo.remove(user);
};
