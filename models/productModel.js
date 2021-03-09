const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A candle must have a name'],
      unique: [
        true,
        'The name of the candle must be unique, try another name',
      ],
      trim: true,
    },
    slug: String,
    scents: {
      type: [String],
      default: [
        'Tangerine & Cinnamon',
        'Cuban Tobacco & Oak',
        'Dark Honey',
      ],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'A candle must have a price'],
    },
    discount: {
      type: Number,
      default: 0.2,
      max: 1,
      min: 0,
    },
    stock: {
      type: Number,
      required: [
        true,
        'You must indicate the current stock of the candle',
      ],
      min: [0, 'A candle stock cannot be lower than 0'],
    },
    newCandle: {
      type: Boolean,
      default: true,
    },
    discontinued: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default:
        'Handcrafted bottle candle. Sustainably made using soy wax and cotton/paper blended wicks. The glass is perfectly finished, completely smooth to touch and faultless in appearance. Available in 3 different scents; Tangerine & Cinnamon (Quintessential Christmas scent) Dark Honey (Cosy darker notes of honey) Cuban Tobacco & Oak (Aromatic vintage cologne) Item will be dispatched within 1/2 business days. Express postage available upon request. Free postage on all multiple item purchases. Please message with any questions or queries. Appropriate safety advice will be supplied. Item is in no way affiliated with the drinks manufacturer. Item supplied and made in the UK.',
      trim: true,
    },
    ratedProduct: {
      type: Boolean,
      default: true,
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 10,
    },
    numberOfSales: {
      type: Number,
      default: 0,
    },
    imageMain: {
      type: String,
      required: [true, 'A candle must have a main image'],
    },
    images: [String],
    materials: {
      type: [String],
      default: ['bottle', 'glass', 'soy wax'],
      trim: true,
    },
    handmade: {
      type: Boolean,
      default: true,
    },
    deliveryCost: {
      type: Number,
      default: 4,
    },
    dispatch: {
      type: String,
      default: '1-2 business days',
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      // select: false,
    },
    secretCandle: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.index({ price: 1, ratingsAverage: -1 });
productSchema.index({ slug: 1 });

productSchema.virtual('priceEuros').get(function () {
  return this.price * 1.14;
});

productSchema.virtual('discountedPrice').get(function () {
  return this.price - this.price * this.discount;
});

productSchema.virtual('reviews', {
  ref: 'Reviews',
  foreignField: 'candle',
  localField: '_id',
});

// DOCUMENT MIDDLEWARE
productSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// QUERY MIDDLEWARE
// productSchema.pre('find', function (next) {
productSchema.pre(/^find/, function (next) {
  this.find({ secretCandle: { $ne: true } });
  this.start = Date.now();
  next();
});

// productSchema.post(/^find/, function (docs, next) {
//   console.log(
//     `query took ${Date.now() - this.start} milliseconds`
//   );
//   console.log(docs);
//   next();
// });

// AGGREGATION MIDDLEWARE
productSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({
    $match: { secretTour: { $ne: true } },
  });
  console.log(this._pipeline);
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
