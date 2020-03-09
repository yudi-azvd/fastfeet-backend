import './bootstrap';
// import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Youch from 'youch';
import * as Sentry from '@sentry/node';
import path from 'path';
import 'express-async-errors';

import routes from './routes';
import sentryConfig from './config/sentry';
import './database';

class App {
  constructor() {
    this.server = express();

    Sentry.init(sentryConfig);

    this.middlewares();
    this.routes();
    this.exceptionHandler();
  }

  middlewares() {
    this.server.use(Sentry.Handlers.requestHandler());
    this.server.use(express.json());
    this.server.use(cors());
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);
    this.server.use(Sentry.Handlers.errorHandler());
  }

  exceptionHandler() {
    this.server.use(async (error, request, response, next) => {
      if (process.env.NODE_ENV === 'development') {
        /**
         * As mensagens de erro são sensíveis.
         * Pro isso devemos enviá-las apenas
         * em ambiente de desenvolvimento
         */
        const errors = await new Youch(error, request).toJSON();

        return response.status(500).json(errors);
      }

      return response.status(500).json({ error: 'Internal server error' });
    });
  }
}

export default new App().server;
