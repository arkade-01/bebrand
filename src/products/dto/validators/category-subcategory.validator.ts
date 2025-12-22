import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { MenSubcategory, WomenSubcategory } from '../../schemas/product.schema';

@ValidatorConstraint({ async: false })
export class IsValidSubcategoryConstraint
  implements ValidatorConstraintInterface
{
  validate(subcategory: string, args: ValidationArguments) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const object = args.object as any;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const category = object.category;

    if (!category || !subcategory) {
      return false;
    }

    if (category === 'men') {
      return Object.values(MenSubcategory).includes(
        subcategory as MenSubcategory,
      );
    }

    if (category === 'women') {
      return Object.values(WomenSubcategory).includes(
        subcategory as WomenSubcategory,
      );
    }

    return false;
  }

  defaultMessage(args: ValidationArguments) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const object = args.object as any;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const category = object.category;

    if (category === 'men') {
      return 'Subcategory must be one of: shirts, pants, accessories, shoes, outerwear, underwear, sportswear';
    }

    if (category === 'women') {
      return 'Subcategory must be one of: life accessories, dresses, tops, bottoms, shoes, accessories, outerwear, underwear, sportswear';
    }

    return 'Invalid subcategory for the selected category';
  }
}

export function IsValidSubcategory(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidSubcategoryConstraint,
    });
  };
}
