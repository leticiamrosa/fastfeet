import { isNil } from 'lodash';
// import Deliveryman from '../models/Deliveryman';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';

class OrderController {
  async index(req, res) {
    const { id, delivery_id } = req.params;

    /**
     * @status - SRO
     * number: id: 1 -> 'Saiu para entrega',
     * number: id: 2 ->'Objeto entregue ao destinatário'
     * number: id: 3 -> 'Em Rota'
     * number: id: 4 -> 'Destinatário ausente'
     * number: id: 5 -> 'Objeto recebido na unidade de distribuição''
     * number: id: 6 ->'Objeto roubado ou objeto extraviado'
     */

    if (!isNil(delivery_id)) {
      const orders = await Delivery.findAll({
        where: {
          deliveryman_id: id,
          status: 'delivered',
          canceled_at: null,
        },
        attributes: ['recipient_id', 'start_date'],
        include: [
          {
            model: Recipient,
            as: 'recipient',
            attributes: [
              'name',
              'street',
              'number',
              'complement',
              'city',
              'state',
              'zip_code',
            ],
          },
        ],
      });

      return res.status(200).json(orders);
    }

    const orders = await Delivery.findAll({
      where: { deliveryman_id: id, end_date: null, canceled_at: null },
      attributes: ['recipient_id', 'start_date'],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'name',
            'street',
            'number',
            'complement',
            'city',
            'state',
            'zip_code',
          ],
        },
      ],
    });

    return res.status(200).json(orders);
  }

  async update() {}
}

export default new OrderController();
