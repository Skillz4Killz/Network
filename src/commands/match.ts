import { Command, CommandStore, KlasaUser, KlasaMessage } from 'klasa';
import { UserSettings } from '../lib/types/settings/UserSettings';

export default class extends Command {

    constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            description: 'Match with a new friend!',
        });
    }

    async run(msg: KlasaMessage) {
        // TODO: Send in embed, and allow cycling thru matches, obviously
        const matches = this.getMatchesFor(msg.author);
        if (matches.length === 0) return msg.send('No matches ;-;');
        return msg.send(`First matched user: ${matches[0].username}`);
    }

    getMatchesFor(user: KlasaUser): KlasaUser[] {
        const [gender, lookingFor, age, languages] = user.settings.pluck(
            UserSettings.Profile.Gender,
            UserSettings.Profile.LookingFor,
            UserSettings.Profile.Age,
            UserSettings.Profile.Language,
        ) as [
            UserSettings.Profile.Gender,
            UserSettings.Profile.LookingFor,
            UserSettings.Profile.Age,
            UserSettings.Profile.Language,
        ];
        const genderFlag = UserProfile.GenderFlags.fromGender(gender);

        return this.client.users
            .array()
            .filter(u => {
                const [otherGender, otherLookingFor, otherLanguages] = u.settings.pluck(
                    UserSettings.Profile.Gender,
                    UserSettings.Profile.LookingFor,
                    UserSettings.Profile.Language,
                ) as [
                    UserSettings.Profile.Gender,
                    UserSettings.Profile.LookingFor,
                    UserSettings.Profile.Language,
                ];
                const otherGenderFlag = UserProfile.GenderFlags.fromGender(otherGender);

                const rightLanguage = languages.some(lang => otherLanguages.some(otherLang => lang === otherLang));
                const rightGender = (lookingFor & otherGenderFlag) !== 0;
                const rightGenderForOther = (otherLookingFor & genderFlag) !== 0;

                return rightLanguage && rightGender && rightGenderForOther;
            })
            .sort((a, b) => {
                const ageDiffs: UserSettings.Profile.Age[] = [];
                for (const u of [a, b]) {
                    const [otherAge] = u.settings.pluck(
                        UserSettings.Profile.Age,
                    ) as [
                        UserSettings.Profile.Age,
                    ];
                    ageDiffs.push(Math.abs(otherAge - age));
                }
                const [aAgeDiff, bAgeDiff] = ageDiffs;
                return aAgeDiff - bAgeDiff;
            })
    }

}
