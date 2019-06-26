import { Task } from "../imports";
import { ClientSettings } from "../lib/types/settings/ClientSettings";

export default class extends Task {

    constructor(...args) {
        // @ts-ignore
        super(args, { name: 'deleteInactiveTemplates', enabled: true });
    }

    async run() {
        const templates = await this.client.settings.get(ClientSettings.GuildTemplates) as ClientSettings.GuildTemplates;
        let inactive = [];
        for (const i of templates) {
            const guild = this.client.guilds.get(i.id);
            if (!guild) inactive.push(i.id);
        }
        const newTemplates = templates.filter(e => !inactive.includes(e.id));
        await this.client.settings.update(ClientSettings.GuildTemplates, newTemplates, { arrayAction: "overwrite", throwOnError: true })
    }

    async init(): Promise<void> {
        this.client.schedule.create('deleteInactiveTemplates', '@daily');
    }
};