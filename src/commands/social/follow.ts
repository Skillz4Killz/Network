import { Command, CommandStore, KlasaMessage, KlasaUser } from '../../imports'

export default class extends Command {
    constructor(store: CommandStore, file: string[], directory: string) {
        super(store, file, directory, {
            name: 'follow',
            aliases: ['followage'],
            runIn: ['text'],
            description: 'Follows users that one decides to follow'
        })
    }

    async run(message: KlasaMessage, user: KlasaUser) {
    
        //

    }
}