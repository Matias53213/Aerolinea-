import {DataSource} from 'typeorm'
import {User} from '../entities/user'
import {TYPE, HOST, USERNAME, PASSWORD, PORT, DATABASE} from './env'
import { Paquete } from '../entities/paquete'

export const AppDataSource = new DataSource({
    type: TYPE,
    host: HOST,
    username: USERNAME,
    password: PASSWORD,
    port: PORT,
    database: DATABASE,
    entities: [User, Paquete],
    subscribers:[],
    migrations: [],
    logging: false,
    synchronize: true,
    dropSchema: false,
})