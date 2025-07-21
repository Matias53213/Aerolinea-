import { Request, Response } from 'express';
import { AppDataSource } from '../dbconfig/db';
import { Reservation } from '../entities/reservation';
import { User } from '../entities/user';
import { Paquete } from '../entities/paquete';

export const createReservation = async (req: Request, res: Response) => {
    const queryRunner = AppDataSource.createQueryRunner();
    
    try {
        await queryRunner.connect();
        await queryRunner.startTransaction();

        const { userId, reservaciones } = req.body;

        if (!Array.isArray(reservaciones)) {
            throw new Error('El formato de reservaciones es incorrecto');
        }

        const userExists = await queryRunner.manager.count(User, { where: { id: userId } });
        if (!userExists) {
            throw new Error(`El usuario con ID ${userId} no existe`);
        }

        const createdReservations = [];
        
        for (const reserva of reservaciones) {
            const { paqueteId, travel_date, return_date, passengers, total_price } = reserva;

            const paqueteExists = await queryRunner.manager.count(Paquete, { where: { id: paqueteId } });
            if (!paqueteExists) {
                throw new Error(`El paquete con ID ${paqueteId} no existe`);
            }

            const precioNumerico = Number(total_price);
            if (isNaN(precioNumerico)) {
                throw new Error('El precio debe ser un número válido');
            }

            const result = await queryRunner.manager.insert(Reservation, {
                travel_date,
                return_date,
                passengers: passengers || 1,
                total_price: precioNumerico,
                status: 'pending',
                user: { id: userId },
                paquete: { id: paqueteId }
            });

            createdReservations.push({
                id: result.identifiers[0].id,
                paqueteId,
                total_price: precioNumerico
            });
        }

        await queryRunner.commitTransaction();
        
        res.status(201).json({
            message: 'Reservas creadas exitosamente',
            reservaciones: createdReservations
        });

    } catch (error: unknown) {
        await queryRunner.rollbackTransaction();
        
        if (error instanceof Error) {
            console.error('Error al crear reservas:', {
                message: error.message,
                ...(error as any).query && { query: (error as any).query },
                ...(error as any).parameters && { parameters: (error as any).parameters }
            });
            
            res.status(500).json({ 
                error: 'Error al crear las reservas',
                detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        } else {
            console.error('Error desconocido al crear reservas:', error);
            res.status(500).json({ error: 'Error desconocido al crear las reservas' });
        }
    } finally {
        await queryRunner.release();
    }
};

export const getReservationById = async (req: Request, res: Response): Promise<void> => {
    try {
        const reservation = await AppDataSource.getRepository(Reservation).findOne({
            where: { id: parseInt(req.params.id) },
            relations: ['user', 'paquete', 'payments']
        });

        if (!reservation) {
            res.status(404).json({ error: 'Reserva no encontrada' });
              ;
        }

        res.json(reservation);
    } catch (error) {
        console.error('Error en getReservationById:', error);
        res.status(500).json({ error: 'Error al obtener la reserva' });
    }
};

export const getUserReservations = async (req: Request, res: Response) => {
  try {
    const reservations = await AppDataSource.getRepository(Reservation).find({
      where: { user: { id: parseInt(req.params.userId) } },
      relations: ['paquete'],
      order: { createdAt: 'DESC' }
    });

    res.json(reservations);
  } catch (error) {
    console.error('Error en getUserReservations:', error);
    res.status(500).json({ error: 'Error al obtener las reservas' });
  }
};

export const getAllReservations = async (req: Request, res: Response) => {
    try {
        const reservations = await AppDataSource.getRepository(Reservation).find({
            relations: ['user', 'paquete', 'payments'],
            order: { createdAt: 'DESC' }
        });
        
        res.status(200).json(reservations);
    } catch (error) {
        console.error('Error al obtener todas las reservas:', error);
        res.status(500).json({ 
            error: 'Error al obtener reservas',
        });
    }
};

export const cancelReservation = async (req: Request, res: Response) => {
  try {
    await AppDataSource.getRepository(Reservation).update(
      parseInt(req.params.id),
      { status: 'cancelled' }
    );
    
    res.json({ message: 'Reserva cancelada exitosamente' });
  } catch (error) {
    console.error('Error en cancelReservation:', error);
    res.status(500).json({ error: 'Error al cancelar la reserva' });
  }
  
};