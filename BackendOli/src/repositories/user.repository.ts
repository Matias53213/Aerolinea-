import { error } from "console";
import { AppDataSource } from "../dbconfig/db";
import { User } from "../entities/user";

const UserRepository = AppDataSource.getRepository(User).extend({
  findById: async function (id: string): Promise<User>{
    const user = await this.findOneBy({id})
    if(user)
    return user;
  else throw error;
  },

  findAllUser: async function (): Promise <User[]>{
    const users = await this.find()
    if(!users)throw Error
    else return users;
  }
})

export default UserRepository;