const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'you must provide a name'],
    },
    email: {
      type: String,
      required: [true, 'you must provide an email'],
      unique: [
        true,
        'this email is already associated with another account',
      ],
      trim: true,
      lowercase: true,
      validate: [
        validator.isEmail,
        'you must provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'you must provide a password'],
      minlength: [
        8,
        'a password must be longer than 8 characters',
      ],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [
        true,
        'you must provide a confirmation of your password',
      ],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: 'your passwords must match',
      },
    },
    passwordChangedAt: Date,
    role: {
      type: String,
      enum: ['user', 'admin', 'dev'],
      default: 'user',
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew)
    return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'basket',
    select: 'candles',
  });
  next();
});

userSchema.virtual('Basket', {
  ref: 'Basket',
  foreignField: 'user',
  localField: '_id',
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(
    candidatePassword,
    userPassword
  );
};

userSchema.methods.changedPasswordAfter = function (
  JWTTimestamp
) {
  if (this.passwordChangedAt) {
    const changedTimestamp =
      this.passwordChangedAt.getTime() / 1000;
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
