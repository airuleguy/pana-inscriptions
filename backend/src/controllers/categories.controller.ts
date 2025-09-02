import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { calculateCategory, isAgeInCategory, ChoreographyCategory, AGE_LIMITS } from '../constants/categories';

@Controller('api/v1/categories')
export class CategoriesController {

  /**
   * Calculate category based on age
   * GET /api/v1/categories/calculate?age=16
   */
  @Get('calculate')
  calculateCategoryFromAge(@Query('age', ParseIntPipe) age: number) {
    return {
      age,
      category: calculateCategory(age),
      ageLimits: AGE_LIMITS
    };
  }

  /**
   * Validate if age is in specific category
   * GET /api/v1/categories/validate?age=16&category=JUNIOR
   */
  @Get('validate')
  validateAgeInCategory(
    @Query('age', ParseIntPipe) age: number,
    @Query('category') category: ChoreographyCategory
  ) {
    return {
      age,
      category,
      isValid: isAgeInCategory(age, category),
      ageLimits: AGE_LIMITS[category]
    };
  }

  /**
   * Get all category information
   * GET /api/v1/categories
   */
  @Get()
  getAllCategories() {
    return {
      categories: Object.values(ChoreographyCategory),
      ageLimits: AGE_LIMITS
    };
  }
}
