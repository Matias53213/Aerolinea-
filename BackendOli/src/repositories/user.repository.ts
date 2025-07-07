// src/repositories/user.repository.ts
import { AppDataSource } from "../dbconfig/db";
import { User } from "../entities/user";

const UserRepository = AppDataSource.getRepository(User).extend({
  /**
   * Busca un usuario por ID
   */
  async findById(id: string): Promise<User> {
    const user = await this.findOneBy({ id });

    if (!user) {
      throw new Error(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  },

  /**
   * Retorna todos los usuarios
   */
  async findAll(): Promise<User[]> {
    return await this.find();
  },

  /**
   * Crea un nuevo usuario
   */
  async createUser(data: Partial<User>): Promise<User> {
    const newUser = this.create(data);
    return await this.save(newUser);
  },

  /**
   * Actualiza un usuario por ID
   */
  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const user = await this.findOneBy({ id });

    if (!user) {
      throw new Error(`Usuario con ID ${id} no encontrado para actualizar`);
    }

    const updatedUser = this.merge(user, data);
    return await this.save(updatedUser);
  },

  /**
   * Elimina un usuario por ID
   */
  async deleteUser(id: string): Promise<void> {
    const result = await this.delete(id);

    if (result.affected === 0) {
      throw new Error(`No se pudo eliminar: Usuario con ID ${id} no existe`);
    }
  },
});

export default UserRepository;