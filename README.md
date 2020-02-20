# Fastfeet Backend
Desafio final desenvolvido para o bootcamp da Rockeseat.

### Setup
Clone o repositório com `git clone` no seu terminal ou clicando no botão verde dessa página
```
yarn install
# ou
npm install
```

Outros programas:

* [Insomnia](https://insomnia.rest/) para testar as requisições para o backend.
* [Postbird](https://www.electronjs.org/apps/postbird) (ou qualquer outro cliente
Postgres) para visualizar o banco de dados.
* [Docker](https://www.docker.com/) para montar a imagem do banco de dados.

#### Variáveis ambiente
Duplique o arquivo `.env.example` e renomeie para `.env`. Então preencha as variáveis
de acordo com as suas informações.


#### Preenchendo o Banco de Dados
Para criar as tabelas do banco de dados, execute as migrações com

```
yarn sequelize db:migrate
```

e depois para preenchê-lo

```
yarn sequelize db:seed:all
```

### Executar
Para iniciar o backend

```
yarn dev
```

