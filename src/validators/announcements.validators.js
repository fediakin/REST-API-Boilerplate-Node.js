import { celebrate, Joi, Segments } from 'celebrate';

const idParamSchema = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.number().integer().positive().required()
  })
};

export const getAllValidator = celebrate({
  [Segments.QUERY]: Joi.object().keys({
    search: Joi.string().allow(''),
    sort: Joi.string().valid('newest', 'oldest'),
    page: Joi.number().integer().min(1)
  })
});

export const getByIdValidator = celebrate(idParamSchema);
export const deleteValidator = celebrate(idParamSchema);

const announcementBodyRules = {
  title: Joi.string().min(5).max(100),
  description: Joi.string().min(10),
  price: Joi.number().positive(),
  category: Joi.string().valid('sale', 'service', 'job', 'other'),
  contactInfo: Joi.string().min(5)
};

export const createValidator = celebrate({
  [Segments.BODY]: Joi.object().keys({
    title: announcementBodyRules.title.required(),
    description: announcementBodyRules.description.required(),
    price: announcementBodyRules.price.required(),
    category: announcementBodyRules.category.required(),
    contactInfo: announcementBodyRules.contactInfo.required()
  })
});

export const updateValidator = celebrate({
  [Segments.PARAMS]: idParamSchema[Segments.PARAMS],
  [Segments.BODY]: Joi.object().keys(announcementBodyRules).min(1)
});