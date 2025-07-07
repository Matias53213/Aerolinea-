import "reflect-metadata"
import app from './app'
import {AppDataSource} from './dbconfig/db'

async function main() {
    try {
    await AppDataSource.initialize()
    console.log('Database Conected')
    app.listen(4000)
    console.log('server listening on port', 4000)
    } catch (error) {
        console.error(error)
    }
}

main()