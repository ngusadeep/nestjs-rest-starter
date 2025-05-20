export class EnableTwoFactorDto {
  password: string;
}

export class VerifyTwoFactorDto {
  code: string;
}

export class DisableTwoFactorDto {
  password: string;
  code: string;
}
