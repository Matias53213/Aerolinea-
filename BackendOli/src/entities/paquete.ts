import { OneToMany, Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Reservation } from './reservation';

@Entity()
export class Paquete {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column({ type: 'text', nullable: true })
    descripcion: string | null;

    @Column('decimal')
    precio: number;

    @Column({ nullable: true })
    imagen: string;

    @Column({ type: 'int', default: 7 })
    duracion: number;

    @Column({ type: 'boolean', default: false })
    destacado: boolean;

    @OneToMany(() => Reservation, reservation => reservation.paquete)
    reservations: Reservation[];
}