import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import configuration from 'src/config/configuration';
import { JwtPayload } from 'src/modules/auth/interfaces/jwt.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: (req: any) => {
        return this.#extractJwtToken(req);
      },
      ignoreExpiration: false,
      secretOrKey: configuration().jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    return { userId: payload.sub, username: payload.email };
  }

  #extractJwtToken(req: any): string | null {
    const jwtPrefix = configuration().jwtPrefix;
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (jwtPrefix && token && token.startsWith(jwtPrefix)) {
      const jwtToken = token.substring(jwtPrefix.length).trim();
      console.log('Extracted JWT Token:', jwtToken);
      return jwtToken;
    }

    throw new ForbiddenException('Invalid token');
  }
}
