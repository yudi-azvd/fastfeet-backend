import Bee from 'bee-queue';

import NewDeliveryMail from '../app/jobs/NewDeliveryMail';
import CancelledDeliveryMail from '../app/jobs/CancelledDeliveryMail';

import redisConfig from '../config/redis';

const jobs = [NewDeliveryMail, CancelledDeliveryMail];

class Queue {
  constructor() {
    /**
     * Cada tipo de background job tem a sua pŕopria fila:
     * email de recuperação de senha, email de cancelamento etc
     */
    this.queues = {};

    this.init();
  }

  /**
   * Cada tipo de job (ex: 'NewDeliveryMail') mapeia para um objeto
   * em this.queues, _bee_ sendo a instância do banco de dados redis
   * e hadle sendo o método para processar o job
   */
  init() {
    /**
     * Desestruturar key e handle de cada job.
     * key á a string que represta unicamente o job (a classe)
     */
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee(key, {
          redis: redisConfig,
        }),
        handle,
      };
    });
  }

  /**
   * queue é a chave, ex: 'NewDeliveyMail',
   * job são os dados do job
   * add adiciona um job em uma fila
   */
  add(queue, job) {
    // queue é a key do job.
    // console.log('');
    // console.log('##############\n', queue, this.queues);
    return this.queues[queue].bee.createJob(job).save();
  }

  processQueue() {
    jobs.forEach(job => {
      const { bee, handle } = this.queues[job.key];

      bee.on('failed', this.handleFailure).process(handle);
    });
  }

  handleFailure(job, error) {
    console.log(`Queue ${job.queue.name}: FAILED`, error);
  }
}

export default new Queue();
