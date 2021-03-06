# Fastfeet Backend
Desafio final desenvolvido para o bootcamp da Rockeseat.

### Setup
Clone o repositório com `git clone` no seu terminal ou clicando no botão verde dessa página. Depois de baixado, abra o diretório no terminal e execute:
```
yarn
# ou
npm install
```

Outros programas:

* [Insomnia](https://insomnia.rest/) cliente de requisições HTTP para testar o backend.
* [Postbird](https://www.electronjs.org/apps/postbird) (ou qualquer outro cliente
Postgres) para visualizar o banco de dados.
* [Docker](https://www.docker.com/) para montar a imagem do banco de dados.

#### Variáveis ambiente
Duplique o arquivo `.env.example` e renomeie para `.env`. Então preencha as variáveis
de acordo com as suas informações.


#### Preenchendo o Banco de Dados
Para criar as tabelas do banco de dados e preenchê-las, execute

```sh
yarn db:populate
```

### Executar
Para iniciar o backend

```sh
yarn dev
# em outra janela de terminal
yarn queue
```

### Workspace do Insomnia
[![Run in Insomnia}](https://insomnia.rest/images/run.svg)](https://insomnia.rest/run/?label=Fasfeet&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fyudi-azvd%2Ffastfeet-backend%2Fmaster%2FInsomnia-fastfeet.json)


### Frontend
Dê uma olhada [aqui](https://github.com/yudi-azvd/fastfeet-frontend) para configurar o backend da aplicação.
