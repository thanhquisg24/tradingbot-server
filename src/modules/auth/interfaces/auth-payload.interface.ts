import { ROLE } from 'src/common/constants';

export interface AuthPayload {
  id: number | string;
  name: null | string;
  email: string;
  roles: ROLE[];
}
