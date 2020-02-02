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
}

export default new RecipientController();
