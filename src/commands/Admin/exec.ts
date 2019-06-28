// Copyright (c) 2017-2019 dirigeants. All rights reserved. MIT license.
import { Command, CommandStore, KlasaMessage, util } from 'klasa';

export default class extends Command {

	public constructor(store: CommandStore, file: string[], dir: string) {
		super(store, file, dir, {
			aliases: ['execute'],
			description: 'Execute commands in the terminal, use with EXTREME CAUTION.',
			extendedHelp: 'Times out in 60 seconds by default. This can be changed with --timeout=TIME_IN_MILLISECONDS',
			guarded: true,
			permissionLevel: 10,
			usage: '<expression:string>'
		});
	}

	public async run(msg: KlasaMessage, [input]: [string]) {
		await msg.sendMessage('Executing your command...');

		const result = await util.exec(input, { timeout: 'timeout' in msg.flags ? Number(msg.flags.timeout) : 60000 })
			.catch(error => ({ stdout: null, stderr: error }));
		const output = result.stdout ? `**\`OUTPUT\`**${util.codeBlock('prolog', result.stdout)}` : '';
		const outerr = result.stderr ? `**\`ERROR\`**${util.codeBlock('prolog', result.stderr)}` : '';

		return msg.sendMessage([output, outerr].join('\n') || 'Done. There was no output to stdout or stderr.');
	}

}
