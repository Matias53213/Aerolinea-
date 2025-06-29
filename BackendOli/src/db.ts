import {DataSource} from 'typeorm'
import {User} from './entities/user'

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    username: 'postgres',
    password: 'Pass12!',
    port: 5432,
    database: 'AeroCastle',
    entities: [User],
    logging: true,
    synchronize: true
})