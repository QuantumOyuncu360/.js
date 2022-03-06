import { APIMessageComponent, APIModalComponent, ComponentType } from 'discord-api-types/v9';
import { ActionRowBuilder, ButtonBuilder, ComponentBuilder, SelectMenuBuilder, TextInputBuilder } from '../index';
import type { MessageComponentBuilder, ModalComponentBuilder } from './ActionRow';
import { UnknownComponentBuilder } from './UnknownComponent';

export interface MappedComponentTypes {
	[ComponentType.ActionRow]: ActionRowBuilder;
	[ComponentType.Button]: ButtonBuilder;
	[ComponentType.SelectMenu]: SelectMenuBuilder;
	[ComponentType.TextInput]: TextInputBuilder;
}

/**
 * Factory for creating components from API data
 * @param data The api data to transform to a component class
 */
export function createComponentBuilder<T extends keyof MappedComponentTypes>(
	data: (APIMessageComponent | APIModalComponent) & { type: T },
): MappedComponentTypes[T];
export function createComponentBuilder<C extends MessageComponentBuilder | ModalComponentBuilder>(data: C): C;
export function createComponentBuilder(
	data: APIMessageComponent | APIModalComponent | MessageComponentBuilder,
): ComponentBuilder {
	if (data instanceof ComponentBuilder) {
		return data;
	}

	switch (data.type) {
		case ComponentType.ActionRow:
			return new ActionRowBuilder(data);
		case ComponentType.Button:
			return new ButtonBuilder(data);
		case ComponentType.SelectMenu:
			return new SelectMenuBuilder(data);
		case ComponentType.TextInput:
			return new TextInputBuilder(data);
		default:
			// @ts-expect-error
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			console.warn(`Cannot properly serialize component type: ${data.type}`);
			return new UnknownComponentBuilder(data);
	}
}
