import { Task } from "../imports";
import { ClientSettings } from "../lib/types/settings/ClientSettings";

export default class extends Task {

    async run() {

        // Get our templates
        const templates = await this.client.settings.get(ClientSettings.GuildTemplates) as ClientSettings.GuildTemplates;
        const inactive = [];

        /* Run over every template and check if the guild it refers to still exists in our cache. 
         If not, add the id to the `inactive` array */
        for (const template of templates) {
            const guild = this.client.guilds.get(template.id);
            if (!guild) inactive.push(template.id);
        }

        // Filter out all the inactive guilds
        const newTemplates = templates.filter(template => !inactive.includes(template.id));

        // Update the database to remove all guilds that no longer exist
        await this.client.settings.update(ClientSettings.GuildTemplates, newTemplates, { arrayAction: "overwrite", throwOnError: true })
    }

    async init() {
        this.client.schedule.create('deleteInactiveTemplates', '@daily', { id: "dia", catchUp: false});
    }
};
