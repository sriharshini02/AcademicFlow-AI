import Joi from "joi";
import { emailRule, passwordRule, roleRule, usernameRule } from "./common/rules";

export const signupSchema = Joi.object({
  name: usernameRule(),
  email: emailRule(), 
  password: passwordRule(), 
  role: roleRule(['HOD', 'Proctor']),
});






