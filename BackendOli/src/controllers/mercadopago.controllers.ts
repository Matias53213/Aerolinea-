import { Request, Response } from 'express';
import { Preference } from 'mercadopago';
import { client } from '../config/mercadopago';

export const crearPreferencia = async (req: Request, res: Response) => {
  try {
    const { items } = req.body;

    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: items.map((item: any) => ({
          title: item.nombre,
          quantity: item.cantidad,
          unit_price: Number(item.precio),
          currency_id: 'ARS',
        })),
        back_urls: {
          success: "127.0.0.1:5500/FrontendOli/pago/pago.html",
          failure: "127.0.0.1:5500/FrontendOli/paquetes/carrito.html",
          pending: "127.0.0.1:5500/FrontendOli/paquetes/carrito.html",
        },
      },
    });

    res.status(200).json({
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error al crear preferencia de pago' });
  }
};