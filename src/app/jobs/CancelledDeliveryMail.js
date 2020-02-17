import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';

import Mail from '../../lib/Mail';

class CancelledDeliveryMail {
  get key() {
    return 'CancelledDeliveryMail';
  }

  // tarefa que será executada
  async handle({ data }) {
    const { delivery } = data;

    await Mail.sendMail({
      to: `${delivery.deliveryman.name} <${delivery.deliveryman.email}>`,
      subject: 'Fastfeet: Entrega cancelada',
      template: 'canceled_delivery',
      context: {
        date: format(
          parseISO(delivery.canceledAt),
          "dd 'de' MMMM', às' H'h'mm",
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

export default new CancelledDeliveryMail();
