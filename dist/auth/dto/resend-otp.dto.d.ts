import { OTPType } from '@prisma/client';
export declare class ResendOtpDto {
    email: string;
    type: OTPType;
}
