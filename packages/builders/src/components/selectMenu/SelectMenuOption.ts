import type { APIMessageComponentEmoji, APISelectMenuOption } from 'discord-api-types/v10';
import {
	defaultValidator,
	emojiValidator,
	labelValueValidator,
	validateRequiredSelectMenuOptionParameters,
} from '../Assertions';
import { UnsafeSelectMenuOption } from './UnsafeSelectMenuOption';

/**
 * Represents a validated option within a select menu component
 */
export class SelectMenuOption extends UnsafeSelectMenuOption {
	public override setDescription(description: string) {
		return super.setDescription(labelValueValidator.parse(description));
	}

	public override setDefault(isDefault = true) {
		return super.setDefault(defaultValidator.parse(isDefault));
	}

	public override setEmoji(emoji: APIMessageComponentEmoji) {
		return super.setEmoji(emojiValidator.parse(emoji));
	}

	public override toJSON(): APISelectMenuOption {
		validateRequiredSelectMenuOptionParameters(this.label, this.value);
		return super.toJSON();
	}
}
