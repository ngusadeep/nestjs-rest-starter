import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Custom decorator to make a field conditionally optional based on another field's value
 * @param property - The property name to check
 * @param values - The values that make this field optional
 * @param validationOptions - Standard validation options
 */
export function IsOptionalWhen(
  property: string,
  values: any[],
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isOptionalWhen',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property, values],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName, relatedValues] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];

          // If the related field has one of the specified values, this field is optional
          if (relatedValues.includes(relatedValue)) {
            return true; // Allow any value including undefined/null
          }

          // Otherwise, this field is required
          return value !== undefined && value !== null && value !== '';
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName, relatedValues] = args.constraints;
          return `${args.property} is required when ${relatedPropertyName} is not one of: ${relatedValues.join(', ')}`;
        },
      },
    });
  };
}

/**
 * Custom decorator to make a field required based on another field's value
 * @param property - The property name to check
 * @param values - The values that make this field required
 * @param validationOptions - Standard validation options
 */
export function IsRequiredWhen(
  property: string,
  values: any[],
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isRequiredWhen',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property, values],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName, relatedValues] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];

          // If the related field has one of the specified values, this field is required
          if (relatedValues.includes(relatedValue)) {
            return value !== undefined && value !== null && value !== '';
          }

          // Otherwise, this field is optional
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName, relatedValues] = args.constraints;
          return `${args.property} is required when ${relatedPropertyName} is one of: ${relatedValues.join(', ')}`;
        },
      },
    });
  };
}
