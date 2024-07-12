import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Type } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from 'src/users/enums/role.enum';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';
import { REQUEST_USER_KEY } from 'src/iam/iam.constants';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Policy } from '../policies/interfaces/policy.interface';
import { POLICIES_KEY } from '../decorators/policies.decorator';
import { PolicyHandlerStorage } from '../policies/policy-handlers.storage';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector,
    private readonly policyHandlerStorage:PolicyHandlerStorage){}
  async canActivate(
    context: ExecutionContext,
  ):Promise<boolean>  {
    const policies = this.reflector.getAllAndOverride<Policy[]>(POLICIES_KEY,[
      context.getHandler(),
      context.getClass()
    ])
    if(policies){
      const user: ActiveUserData = context.switchToHttp().getRequest()[REQUEST_USER_KEY]
      await Promise.all(policies.map((policy) => {
        const policyHandler = this.policyHandlerStorage.get(
          policy.constructor as Type,
        )
        return policyHandler.handle(policy,user)
      })
    ).catch((err) =>{
      throw new ForbiddenException(err.message)
    })
    }
    return true 
  }
}
