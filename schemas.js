const Joi = require('joi');

module.exports.campgroundValidateSchema = Joi.object({
    campground: Joi.object({
      title: Joi.string().required(),
      location: Joi.string().required(),
      image: Joi.string().required(),
      description: Joi.string().required(),
      price: Joi.number().required().min(0),
    }).required()
  });