import * as Yup from 'yup';
import { isLength } from 'lodash';
import { isBefore, parseISO, isAfter, isWeekend, getHours } from 'date-fns';
import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import File from '../models/File';

class DeliveryController {
  async index(req, res) {
    const { page = 1, limit = 20 } = req.query;

    if (
      !isLength(Number(limit)) ||
      !isLength(Number(page)) ||
      limit === '' ||
      page === ''
    ) {
      return res.status(405).json({ error: 'Empty pagination are not allow' });
    }

    const delivery = await Delivery.findAll({
      attributes: ['id', 'product', 'start_date', 'end_date', 'signature_id'],
      limit,
      offset: (page - 1) * 20,
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['name', 'path', 'url'],
            },
          ],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'id',
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
    return res.json(delivery);
  }

  async store(req, res) {
    const deliverySchema = Yup.object().shape({
      product: Yup.string().required(),
      start_date: Yup.date().required(),
      deliveryman_id: Yup.number().required(),
      recipient_id: Yup.number().required(),
    });

    /**
     * check for delivery schema is valid
     */

    if (!(await deliverySchema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const deliveryman = await Deliveryman.findOne({
      where: { id: req.body.deliveryman_id },
    });

    const { deliveryman_id, recipient_id, start_date } = req.body;

    /**
     * check for deliveryman
     */

    if (!deliveryman) {
      return res
        .status(401)
        .json({ error: 'You can only create deliveries with deliverymans.' });
    }

    /**
     * check for recipient
     */

    const recipientExists = await Recipient.findByPk(recipient_id);

    if (!recipientExists) {
      return res.status(400).json({ error: 'Recipient could not be located.' });
    }

    /**
     * check for delivery already exists
     */

    const deliveryExists = await Delivery.findOne({
      where: { recipient_id, canceled_at: null, end_date: null },
    });

    if (deliveryExists) {
      return res.status(400).json({ error: 'Delivery already exists.' });
    }

    /**
     * check for delivery canceled
     */

    const isDeliveryCanceled = await Delivery.findOne({
      where: { recipient_id, canceled_at: null, end_date: null },
    });

    if (isDeliveryCanceled) {
      return res.status(400).json({ error: 'Delivery are canceled' });
    }

    const now = new Date();
    const hourStart = parseISO(start_date);
    const hoursAvaiable = getHours(hourStart);

    const avaiable = hoursAvaiable > 8 && hoursAvaiable < 18;

    if (!avaiable) {
      return res.status(403).json({
        error: 'Hour is not available.',
      });
    }

    /**
     * check for weekend
     */
    if (isWeekend(hourStart)) {
      return res
        .status(403)
        .json({ error: 'Weekends dates are not permitted.' });
    }

    /**
     * check for past dates
     */

    if (isBefore(hourStart, now)) {
      return res.status(400).json({ error: 'Past dates are not permitted. ' });
    }

    /**
     * check date availability
     */

    const checkAvailability = await Delivery.findOne({
      where: {
        recipient_id,
        canceled_at: null,
        start_date: hourStart,
      },
    });

    if (checkAvailability) {
      return res.status(400).json({ error: 'Date is not available' });
    }

    /**
     * check for signature
     */

    const { signature_id, product } = await Delivery.create(req.body);

    return res.json({
      recipient_id,
      deliveryman_id,
      signature_id,
      product,
      start_date: hourStart,
    });
  }

  async update(req, res) {
    const deliverySchema = Yup.object().shape({
      product: Yup.string(),
      start_date: Yup.date(),
      end_date: Yup.date(),
      signature_id: Yup.string().required(),
    });

    if (!(await deliverySchema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const delivery = Delivery.findByPk(req.params.id);

    const { start_date, end_date } = req.body;

    /**
     * check end date
     */
    const now = new Date();
    const hourEnd = parseISO(end_date);

    if (isAfter(hourEnd, now)) {
      return res
        .status(400)
        .json({ error: 'Future dates are not permitted. ' });
    }

    const { product, signature_id } = await delivery.update(req.body);
    return res.json({ product, start_date, end_date, signature_id });
  }
}

export default new DeliveryController();
