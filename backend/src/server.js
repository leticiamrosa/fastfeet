import app from "./app";
const port = 3333;
const msg = `Servidor rodando com sucesso em http://localhost:${port}`;

app.listen(port, () => console.log(msg));
