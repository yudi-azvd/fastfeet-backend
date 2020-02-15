import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';

import Mail from '../../lib/Mail';

class CanceledDeliveryMail {
  get key() {
    return 'CanceledDeliveryMail';
  }

  // tarefa que será executada
  async handle({ data }) {
    const { delivery } = data;

    console.log(`${delivery.deliveryman.name} <${delivery.deliveryman.email}>`);

    await Mail.sendMail({
      to: `${delivery.deliveryman.name} <${delivery.deliveryman.email}>`,
      subject: 'Fastfeet: Entrega cancelada',
      template: 'canceled_delivery',
      context: {
        date: format(
          parseISO(delivery.canceledAt),
          "dd 'de' MMMM', às' H:mm'h'",
          { locale: pt }
        ),
        deliveryId: delivery.id,
        deliveryman: delivery.deliveryman.name,
        product: delivery.product,
        recipient: delivery.recipient.name,
      },
    });
  }
}

export default new CanceledDeliveryMail();
