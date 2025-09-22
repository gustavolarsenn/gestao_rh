import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return req.user as { userId: string; companyId: string; email: string } | undefined;
});