import db from '../../database/knex.js';
import { PasswordHelper } from '../../helpers/hashed.service.js';
import { JwtService } from '../../helpers/jwt.service.js';
import type { AuthResponse } from './auth.types.js';

export class AuthService {
  private readonly passwordHelper =
    new PasswordHelper();

  private readonly jwtService =
    new JwtService();

  async login(
    email: string,
    password: string,
  ): Promise<AuthResponse> {
    const staff = await db('staff')
      .select(
        'id',
        'email',
        'name',
        'password_hash',
      )
      .where({ email })
      .first();

    if (!staff) {
      throw new Error('Invalid credentials');
    }

    const passwordMatch =
      await this.passwordHelper.compare(
        password,
        staff.password_hash,
      );

    if (!passwordMatch) {
      throw new Error('Invalid credentials');
    }

    const token = this.jwtService.sign({
      id: staff.id,
    });

    return {
      token,

      user: {
        id: staff.id,
        email: staff.email,
        name: staff.name,
      },
    };
  }

  async getStaff(id: number) {
    return db('staff')
      .select(
        'id',
        'email',
        'name',
        'created_at',
        'updated_at',
      )
      .where({ id })
      .first();
  }
}