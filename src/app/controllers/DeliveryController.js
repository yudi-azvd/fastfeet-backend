import Delivery from '../models/Delivery';

class DeliveryController {
  async store(request, response) {
    //
    const del = await Delivery.create(request.body);

    return response.json(del);
  }
}

export default new DeliveryController();
