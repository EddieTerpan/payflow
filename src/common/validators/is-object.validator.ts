import {
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

export function IsObjectId(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsObjectId',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          // each: true
          if (validationOptions?.each && Array.isArray(value)) {
            return value.every((v) => /^[a-fA-F0-9]{24}$/.test(v));
          }

          return typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value);
        },

        defaultMessage() {
          return 'Invalid ObjectId format (must be 24 hex characters)';
        },
      },
    });
  };
}
