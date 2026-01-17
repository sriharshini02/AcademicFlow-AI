import Joi from 'joi';
import { MESSAGES } from './messages';
import { PATTERNS } from './patterns';

export const usernameRule = () =>
  Joi.string()
    .trim()
    .required()
    .min(3)
    .max(30)
    .pattern(PATTERNS.USER_NAME)
    .messages(MESSAGES.NAME)

export const emailRule = () =>
  Joi.string()
    .trim()
    .required()
    .email({minDomainSegments: 2, tlds: { allow: ['com', 'edu', 'org', 'in'] } })
    .messages(MESSAGES.EMAIL);

export const passwordRule = () =>
  Joi.string()
    .trim()
    .required()
    .min(8)
    .max(30)
    .pattern(PATTERNS.PASSWORD)
    .messages(MESSAGES.PASSWORD);

export const roleRule = (roles: string[]) =>
  Joi.string()
    .valid(...roles)
    .required()
    .messages(MESSAGES.ROLE);
