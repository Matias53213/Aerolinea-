import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, BaseEntity, JoinColumn } from 'typeorm';
import { User } from './user';
import { Paquete } from './paquete';
import { Payment } from './payment';

@Entity()
export class Reservation extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'date' })
    travel_date: Date;

    @Column({ type: 'date' })
    return_date: Date;

    @Column({ type: 'int', default: 1 })
    passengers: number;

    @Column({
        type: 'numeric', 
        precision: 10, 
        scale: 2,
        nullable: false,
        transformer: {
            to: (value: number) => value,
            from: (value: string) => parseFloat(value)
        }
    })
    total_price: number;

    @Column({ 
        type: 'varchar', 
        default: 'pending',
        enum: ['pending', 'confirmed', 'cancelled', 'completed']
    })
    status: string;

    @ManyToOne(() => User, user => user.reservations)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Paquete, paquete => paquete.reservations)
    @JoinColumn({ name: 'paquete_id' })
    paquete: Paquete;

    @OneToMany(() => Payment, payment => payment.reservation, {
        cascade: true, 
        eager: false 
    })
    payments: Payment[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    async confirm() {
        this.status = 'confirmed';
        return await this.save();
    }

    async cancel() {
        this.status = 'cancelled';
        return await this.save();
    }
}