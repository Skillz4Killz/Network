import { KlasaMessage, Monitor, MonitorStore } from 'klasa'

export default class extends Monitor {
    constructor(file: string[], store: MonitorStore, directory: string) {
        super(file, store, directory, {
            name: 'Reaction',
            ignoreSelf: true,
            enabled: true
        })
    }

    async run(message: KlasaMessage) {

        if(!message.guild.me.hasPermission('ADD_REACTIONS')) return message.send('I have no perms to react!')

        let heartemote = this.client.emojis.get('emojiID')
        let replayemote = this.client.emojis.get('emojiID')
        let followemote = this.client.emojis.get('emojiID')

        let wallChannel = message.guild.settings.get('wall')
        if(wallChannel)
        message.react(heartemote)
        message.react(replayemote)
        message.react(followemote)
        if(!wallChannel) return null

    }
}