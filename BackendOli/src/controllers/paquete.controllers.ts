import { Request, Response } from 'express';
import { AppDataSource } from '../dbconfig/db';
import { Paquete } from '../entities/paquete';

type ExpressHandler = (req: Request, res: Response) => Promise<Response | void>;

export const getPaquetes: ExpressHandler = async (req, res) => {
    try {
        const repo = AppDataSource.getRepository(Paquete);
        const destacado = req.query.destacado === 'true';

        const paquetes = await repo.find({
            where: destacado ? { destacado: true } : {},
            order: { id: 'ASC' }
        });

        const paquetesConvertidos = paquetes.map(p => ({
            ...p,
            precio: Number(p.precio),
            duracion: p.duracion ?? 7
        }));

        return res.json(paquetesConvertidos);
    } catch (error) {
        console.error('Error al obtener paquetes:', error);
        return res.status(500).json({ 
            error: 'Error interno del servidor',
        });
    }
};

export const getPaqueteById: ExpressHandler = async (req, res) => {
    try {
        const paquete = await AppDataSource.getRepository(Paquete).findOneBy({ 
            id: parseInt(req.params.id) 
        });
        
        if (!paquete) {
            return res.status(404).json({ error: 'Paquete no encontrado' });
        }

        paquete.duracion = paquete.duracion ?? 7;
        return res.json(paquete);
    } catch (error) {
        console.error('Error al obtener paquete:', error);
        return res.status(500).json({ 
            error: 'Error interno del servidor',
        });
    }
};

export const createPaquete: ExpressHandler = async (req, res) => {
    try {
        const { nombre, descripcion, precio, imagen, duracion, destacado } = req.body;
        
        if (!nombre || !descripcion || isNaN(parseFloat(precio))) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const nuevoPaquete = AppDataSource.getRepository(Paquete).create({
            nombre,
            descripcion,
            precio: parseFloat(precio),
            imagen: imagen || 'default.jpg',
            duracion: duracion ? parseInt(duracion) : 7,
            destacado: destacado === true || destacado === 'true' ? true : false,
        });
        
        const resultado = await AppDataSource.getRepository(Paquete).save(nuevoPaquete);
        return res.status(201).json(resultado);
    } catch (error) {
        console.error('Error al crear paquete:', error);
        return res.status(500).json({ 
            error: 'Error interno del servidor',
        });
    }
};

export const deletePaquete: ExpressHandler = async (req, res) => {
    try {
        const resultado = await AppDataSource.getRepository(Paquete).delete(
            parseInt(req.params.id)
        );
        
        if (resultado.affected === 0) {
            return res.status(404).json({ error: 'Paquete no encontrado' });
        }
        
        return res.json({ 
            message: 'Paquete eliminado correctamente',
            id: req.params.id 
        });
    } catch (error) {
        console.error('Error al eliminar paquete:', error);
        return res.status(500).json({ 
            error: 'Error interno del servidor',
        });
    }
};


export const updatePaquete: ExpressHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, imagen, duracion, destacado } = req.body;
        
        const paquete = await AppDataSource.getRepository(Paquete).findOneBy({ 
            id: parseInt(id) 
        });
        
        if (!paquete) {
            return res.status(404).json({ error: 'Paquete no encontrado' });
        }

        if (nombre) paquete.nombre = nombre;
        if (descripcion) paquete.descripcion = descripcion;
        if (precio) paquete.precio = parseFloat(precio);
        if (imagen) paquete.imagen = imagen;
        if (duracion) paquete.duracion = parseInt(duracion);
        if (typeof destacado !== 'undefined') paquete.destacado = destacado === true || destacado === 'true';

        const resultado = await AppDataSource.getRepository(Paquete).save(paquete);
        return res.json(resultado);
    } catch (error) {
        console.error('Error al actualizar paquete:', error);
        return res.status(500).json({ 
            error: 'Error interno del servidor',
        });
    }
};
