import * as Yup from 'yup';
import { isLength } from 'lodash';
import Recipient from '../models/Recipient';

class RecipientController {
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

    const recipient = await Recipient.findAll({
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
      limit,
      offset: (page - 1) * 20,
    });
    return res.json(recipient);
  }

  async store(req, res) {
    const recipientSchema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.number().required(),
      complement: Yup.string(),
      city: Yup.string().required(),
      state: Yup.string().required(),
      zip_code: Yup.string()
        .required()
        .min(9)
        .max(9),
    });

    if (!(await recipientSchema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const {
      id,
      name,
      street,
      number,
      complement,
      city,
      state,
      zip_code,
    } = await Recipient.create(req.body);

    return res.json({
      id,
      name,
      street,
      number,
      complement,
      city,
      state,
      zip_code,
    });
  }

  async update(req, res) {
    const recipientSchema = Yup.object().shape({
      recipient_id: Yup.number(),
      name: Yup.string(),
      street: Yup.string(),
      number: Yup.number(),
      complement: Yup.string(),
      city: Yup.string(),
      state: Yup.string(),
      zip_code: Yup.string()
        .min(9)
        .max(9),
    });

    if (!(await recipientSchema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const { recipient_id } = req.body;

    const recipient = await Recipient.findByPk(recipient_id);

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient does not found' });
    }

    const {
      name,
      street,
      number,
      complement,
      city,
      state,
      zip_code,
    } = await recipient.update(req.body);

    return res.json({
      recipient_id,
      name,
      street,
      number,
      complement,
      city,
      state,
      zip_code,
    });
  }

  async delete(req, res) {
    const { id } = req.params;

    const recipient = await Recipient.findByPk(id);

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient does not found' });
    }

    await Recipient.destroy({
      where: { id },
    });

    return res.status(200).json({
      success: 'Recipient has been successfully deactivated',
      id,
    });
  }
}

export default new RecipientController();
