namespace UserProfile {
    export enum Gender {
        Neutral,
        Male,
        Female,
        Nonbinary,
    }
    
    export namespace Gender {
        export const length = Object.keys(Gender).length / 2;

        export const fromGenderFlag = (flag: GenderFlags): Gender =>
            Gender[GenderFlags[flag]];
    }

    export enum GenderFlags {
        Neutral    = 0,
        Male       = 1 << 0,
        Female     = 1 << 1,
        Nonbinary  = 1 << 2,

        All = Male | Female | Nonbinary,
    }

    export namespace GenderFlags {
        export const fromGender = (gender: Gender): GenderFlags =>
            GenderFlags[Gender[gender]];
    }
}
