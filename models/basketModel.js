const mongoose = require('mongoose');

const basketSchema = new mongoose.Schema(
  {
    candle: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [
        true,
        'You must provide a candle to add to the basket',
      ],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    scent: {
      type: String,
      enum: [
        'Tangerine & Cinnamon',
        'Cuban Tobacco & Oak',
        'Dark Honey',
      ],
      required: [
        true,
        'you must provide scents that you want to add',
      ],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

basketSchema.index({ candle: 1, scent: 1 });
basketSchema.index({ user: 1 });

const Basket = mongoose.model('Basket', basketSchema);

module.exports = Basket;
