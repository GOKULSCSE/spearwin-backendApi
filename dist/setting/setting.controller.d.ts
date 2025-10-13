export declare class SettingController {
    fineAll(): string;
    findSettingById(body: {
        id: string;
        name: string;
    }, id: string): {
        id: string;
        name: string;
    };
}
