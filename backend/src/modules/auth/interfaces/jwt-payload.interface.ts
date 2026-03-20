import { UserRole } from '../../../entities/user.entity';

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole | string;
}
