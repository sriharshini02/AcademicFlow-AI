export const PATTERNS = {
  USER_NAME: new RegExp('^[A-Za-z0-9]+(?: [A-Za-z0-9]+)*$'),
  PASSWORD: new RegExp('^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?& ]{8,30}$'),
};
