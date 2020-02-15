import Mail from '../../lib/Mail';

class NewDeliveryMail {
  get key() {
    return 'NewDeliveryMail';
  }

  // tarefa que será executada
  async handle({ data }) {
    const { delivery } = data;

    await Mail.sendMail({
      to: `${delivery.deliveryman.name} <${delivery.deliveryman.email}>`,
      subject: 'Fastfeet: Nova entrega',
      template: 'new_delivery',
      context: {
        deliveryId: delivery.id,
        deliveryman: delivery.deliveryman.name,
        product: delivery.product,
        recipient: delivery.recipient.name,
        state: delivery.recipient.state,
        city: delivery.recipient.city,
        street: delivery.recipient.street,
        number: delivery.recipient.number,
        complement: delivery.recipient.complement,
      },
    });
  }
}

export default new NewDeliveryMail();
