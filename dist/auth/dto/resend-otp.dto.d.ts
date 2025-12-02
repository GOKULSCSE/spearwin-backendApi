export declare enum OTPType {
    EMAIL_VERIFICATION = "EMAIL_VERIFICATION",
    PHONE_VERIFICATION = "PHONE_VERIFICATION",
    PASSWORD_RESET = "PASSWORD_RESET",
    TWO_FACTOR_AUTH = "TWO_FACTOR_AUTH"
}
export declare class ResendOtpDto {
    email: string;
    type: OTPType;
}
