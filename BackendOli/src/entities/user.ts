import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, BaseEntity} from 'typeorm'

@Entity()
export class User extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: string

    @Column()
    firstname: string

    @Column()
    lastname: string

    @Column({
    default: true
    })
    active: boolean

    @CreateDateColumn()
    createAt:Date;

    @UpdateDateColumn()
    updateAd: Date;
}