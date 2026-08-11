import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: number;
}

export class JwtService {
  private readonly secret = process.env.JWT_SECRET!;

  sign(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: '1d',
    });
  }

  verify(token: string): JwtPayload {
    return jwt.verify(token, this.secret) as JwtPayload;
  }
}