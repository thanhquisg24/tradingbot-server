import { ValidationError } from 'class-validator';

export const getErrorMessage = (error: ValidationError): ValidationError => {
  if (!error.children || error.children.length === 0) return error;
  return getErrorMessage(error.children[0]);
};

export const filterMessages = (validationErr: ValidationError[]) => {
  return validationErr
    .map((error) => {
      let message = '';
      error = getErrorMessage(error);
      message =
        error.constraints && Object.values(error.constraints).join(', ');
      if (!message) message = `${error.property} is invalid`;
      return message;
    })
    .join(', ');
};
