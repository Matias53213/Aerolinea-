import { User } from "../entities/user";
import UserRepository from "../repositories/user.repository";

export const getUserByIdService = async (id: string): Promise <User> =>{
    try {
        const user = await UserRepository.findById(id)
            if (!user) {
      throw new Error(`Usuario con ID ${id} no encontrado`);
    }
        return user
    } catch (error) {
        throw error;       
    }
}

export const getAllUsersService = async (): Promise<User[]> => {
  try {
    const users = await UserRepository.findAll();
    return users;
  } catch (error) {
    throw error;
  }
};