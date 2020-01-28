import app from './app';
import 'dotenv/config';

const msg = `Servidor rodando com sucesso em http://localhost:${process.env.APP_PORT}`;

app.listen(process.env.APP_PORT, () => console.log(msg));
