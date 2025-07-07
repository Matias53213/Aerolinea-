import {DataSource} from 'typeorm'
import {User} from '../entities/user'
import {TYPE, HOST, USERNAME, PASSWORD, PORT, DATABASE} from './env'

export const AppDataSource = new DataSource({
    type: TYPE,
    host: HOST,
    username: USERNAME,
    password: PASSWORD,
    port: PORT,
    database: DATABASE,
    entities: [User],
    subscribers:[],
    migrations: [],
    logging: true,
    synchronize: true,
    dropSchema: true,
})