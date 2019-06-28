import { Task } from '../imports';
import { ClientSettings } from '../lib/types/settings/ClientSettings';

export default class extends Task {

	public async run() {
		// Get our templates
		const templates = await this.client.settings.get(ClientSettings.GuildTemplates) as ClientSettings.GuildTemplates;

		// Filter out all the inactive guilds
		const newTemplates = templates.filter(id => this.client.guilds.has(id));

		if (templates.length === newTemplates.length) return null;

		// Update the database to remove all guilds that no longer exist
		return this.client.settings.update(ClientSettings.GuildTemplates, newTemplates, { arrayAction: 'overwrite', throwOnError: true });
	}

	public async init() {
		const taskExists = this.client.schedule.tasks.some(task => task.taskName === 'deleteInactiveTemplates');
		if (!taskExists) this.client.schedule.create('deleteInactiveTemplates', '@daily');
	}

}
