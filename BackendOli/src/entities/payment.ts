import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, BaseEntity } from 'typeorm';
import { Reservation } from './reservation';

@Entity()
export class Payment extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    paymentId: string;
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    amount: number;

    @Column({ type: 'varchar', default: 'pending' })
    status: string;

    @Column({ type: 'varchar', default: 'MercadoPago' })
    method: string;

    @CreateDateColumn()
    paymentDate: Date;

    @ManyToOne(() => Reservation, reservation => reservation.payments)
    reservation: Reservation;
}