import { KlasaMessage, Monitor, MonitorStore } from 'klasa'

export default class extends Monitor {
    constructor(file: string[], store: MonitorStore, directory: string) {
        super(file, store, directory, {
            ignoreOthers: false
        })
    }

    async run(message: KlasaMessage) {

        if(!message.guild.me.hasPermission('ADD_REACTIONS')) return null

        const wallChannel = message.guild.settings.get('wall')
        if(!wallChannel) return null
        for(const reaction of ['💟', '🔁', '➕']) await message.react(reaction)

    }
}