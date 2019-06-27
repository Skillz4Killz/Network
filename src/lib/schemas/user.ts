import { KlasaClient } from 'klasa';
import { UserProfile } from '../types/enums/UserProfile';

KlasaClient.defaultUserSchema
	.add('following', 'user', { array: true })
	.add('profile', profileFolder => profileFolder
		.add('serverID', 'guild')
		.add('language', 'string', {
			'array': true,
			'default': [UserProfile.Language.EnUS]
		})
		.add('gender', 'integer', {
			'default': UserProfile.Gender.Neutral,
			'min': 0,
			'max': UserProfile.Gender.length
		})
		.add('age', 'integer', {
			min: 13,
			max: 100
		})
		.add('lookingFor', 'integer', {
			min: 0,
			max: UserProfile.GenderFlags.All
		})
		.add('politics', 'string')
		.add('religion', 'string'));
