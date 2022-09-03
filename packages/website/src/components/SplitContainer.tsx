import { styled } from '../../stitches.config';

export const SplitContainer = styled('div', {
	display: 'flex',
	placeContent: 'space-between',
	placeItems: 'center',
	gap: 20,

	variants: {
		vertical: {
			true: {
				flexDirection: 'column',
				placeContent: 'unset',
			},
		},

		grow: {
			true: {
				flexGrow: 1,
			},
		},

		center: {
			true: {
				placeContent: 'center',
			},
		},
	},
});
