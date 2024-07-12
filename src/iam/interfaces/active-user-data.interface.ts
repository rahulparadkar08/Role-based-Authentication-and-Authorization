import { Role } from "src/users/enums/role.enum";
import { PermissionType } from "../authorization/permission.type";

export interface ActiveUserData{
    permission: any;
    sub:number;
    email:string;
    role:Role;
    permissions:PermissionType[]
}