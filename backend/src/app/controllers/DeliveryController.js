import * as Yup from 'yup';
import { startOfHour, isBefore, parseISO } from 'date-fns';
import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';

class DeliveryController {
  async store(req, res) {
    const deliverySchema = Yup.object().shape({
      product: Yup.string().required(),
      start_date: Yup.date().required(),
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

    /**
     * check for past dates
     */

    const hourStart = startOfHour(parseISO(start_date));

    if (isBefore(hourStart, new Date())) {
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
      return res
        .status(400)
        .json({ error: 'Appointment date is not available' });
    }

    const { signatur_id, product } = await Delivery.create(req.body);

    return res.json({
      recipient_id,
      deliveryman_id,
      signatur_id,
      product,
      start_date: hourStart,
    });
  }
}

export default new DeliveryController();
