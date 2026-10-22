import { Body, Controller, Post } from '@nestjs/common';
import { ApiResult } from '@personal-dashboard/shared/common';
import {
  registerInputSchema,
  type IRegisterInput,
  type IUserOutput,
} from '@personal-dashboard/shared/identity';
import { RegisterUseCase } from '@application/identity';
import { ZodValidationPipe } from '@common';

@Controller('auth')
export class AuthController {
  constructor(private readonly registerUseCase: RegisterUseCase) {}

  @Post('register')
  async register(
    @Body(new ZodValidationPipe(registerInputSchema)) data: IRegisterInput,
  ): Promise<ApiResult<IUserOutput>> {
    return ApiResult.success(await this.registerUseCase.handle(data));
  }
}
