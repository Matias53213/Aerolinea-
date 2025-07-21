import { Request, Response } from 'express';
import { AppDataSource } from '../dbconfig/db';
import { Payment } from '../entities/payment';
import { Reservation } from '../entities/reservation';

export const registerPayment = async (req: Request, res: Response): Promise<void> => {
    const queryRunner = AppDataSource.createQueryRunner();

    try {
        await queryRunner.connect();
        await queryRunner.startTransaction();
        
        const { paymentId, reservationIds, status, amount } = req.body;

        if (!paymentId || !Array.isArray(reservationIds) || reservationIds.length === 0 || amount === undefined || isNaN(amount)) {
            throw new Error('Datos de pago inválidos');
        }

        const reservations = await Promise.all(
            reservationIds.map(id => 
                queryRunner.manager.findOne(Reservation, {
                    where: { id: Number(id) },
                    relations: ['user', 'paquete']
                })
            )
        );

        if (reservations.some(r => !r)) {
            throw new Error('Una o más reservas no fueron encontradas');
        }

        const existingPayment = await queryRunner.manager.findOne(Payment, {
            where: { paymentId }
        });

        if (existingPayment) {
            await queryRunner.manager.update(
                Payment,
                { paymentId },
                {
                    status: status === 'approved' ? 'approved' : 'pending',
                    amount: Number(amount)
                }
            );
        } else {
            await Promise.all(
                reservationIds.map(reservationId => 
                    queryRunner.manager.save(Payment, {
                        paymentId: `${paymentId}-${reservationId}`,
                        amount: Number(amount) / reservationIds.length,
                        status: status === 'approved' ? 'approved' : 'pending',
                        method: 'MercadoPago',
                        reservation: { id: Number(reservationId) }
                    })
                )
            );
        }

        if (status === 'approved') {
            await Promise.all(
                reservationIds.map(id =>
                    queryRunner.manager.update(
                        Reservation,
                        Number(id),
                        { status: 'confirmed' }
                    )
                )
            );
        }

        await queryRunner.commitTransaction();
        
        res.status(201).json({
            success: true,
            message: existingPayment ? 'Pago actualizado' : 'Pago registrado',
            reservations: reservations.map(r => ({
                id: r!.id,
                status: status === 'approved' ? 'confirmed' : r!.status,
                paquete: r!.paquete
            }))
        });

    } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error('Error en registerPayment:', error);
        
        res.status(500).json({ 
            success: false,
            error: error instanceof Error ? error.message : 'Error al registrar el pago',
        });
    } finally {
        await queryRunner.release();
    }
};

export const getPaymentInfo = async (req: Request, res: Response): Promise<void> => {
    try {
        const payment = await AppDataSource.getRepository(Payment).findOne({
            where: { paymentId: req.params.paymentId },
            relations: ['reservation']
        });

        if (!payment) {
            res.status(404).json({ error: 'Pago no encontrado' });
            return;
        }

        res.json(payment);
    } catch (error) {
        console.error('Error en getPaymentInfo:', error);
        res.status(500).json({ error: 'Error al obtener el pago' });
    }
};
export const getReservations = async (req: Request, res: Response) => {
    try {
        const reservations = await AppDataSource.getRepository(Reservation).find({
            relations: ['user', 'paquete', 'payments'],
            order: { createdAt: 'DESC' }
        });
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener reservas' });
    }
};

export const confirmReservation = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await AppDataSource.getRepository(Reservation).update(id, { 
            status: 'confirmed' 
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error al confirmar reserva' });
    }
};

export const cancelReservation = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await AppDataSource.getRepository(Reservation).update(id, { 
            status: 'cancelled' 
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error al cancelar reserva' });
    }
};