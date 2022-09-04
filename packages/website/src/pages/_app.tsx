import { MantineProvider } from '@mantine/core';
// import { type SpotlightAction, SpotlightProvider } from '@mantine/spotlight';
import type { AppProps } from 'next/app';
import Head from 'next/head';
// import { type NextRouter, useRouter } from 'next/router';
import NextProgress from 'next-progress';
import { ThemeProvider, useTheme } from 'next-themes';
// import { VscPackage } from 'react-icons/vsc';
import '@unocss/reset/antfu.css';
import '../styles/unocss.css';
import '../styles/main.css';
// import { miniSearch } from '~/util/search';

// const actions: (router: NextRouter) => SpotlightAction[] = (router: NextRouter) => [
// 	{
// 		title: 'Home',
// 		description: 'Go to landing page',
// 		onTrigger: () => void router.push('/'),
// 		icon: <VscPackage size={20} />,
// 	},
// 	{
// 		title: 'Packages',
// 		description: 'Go to the package selection',
// 		onTrigger: () => void router.push('/docs/packages'),
// 		icon: <VscPackage size={20} />,
// 	},
// 	{
// 		id: 'packages-builders',
// 		title: 'Builders',
// 		description: 'Go to the @discordjs/builders documentation',
// 		onTrigger: () => void router.push('/docs/packages/builders'),
// 		icon: <VscPackage size={20} />,
// 	},
// 	{
// 		id: 'packages-collection',
// 		title: 'Collection',
// 		description: 'Go to the @discordjs/collection documentation',
// 		onTrigger: () => void router.push('/docs/packages/collection'),
// 		icon: <VscPackage size={20} />,
// 	},
// 	{
// 		id: 'packages-proxy',
// 		title: 'Proxy',
// 		description: 'Go to the @discordjs/proxy documentation',
// 		onTrigger: () => void router.push('/docs/packages/proxy'),
// 		icon: <VscPackage size={20} />,
// 	},
// 	{
// 		id: 'packages-rest',
// 		title: 'REST',
// 		description: 'Go to the @discordjs/rest documentation',
// 		onTrigger: () => void router.push('/docs/packages/voice'),
// 		icon: <VscPackage size={20} />,
// 	},
// 	{
// 		id: 'packages-voice',
// 		title: 'Voice',
// 		description: 'Go to the @discordjs/voice documentation',
// 		onTrigger: () => void router.push('/docs/packages/ws'),
// 		icon: <VscPackage size={20} />,
// 	},
// 	{
// 		id: 'packages-ws',
// 		title: 'WS',
// 		description: 'Go to the @discordjs/ws documentation',
// 		onTrigger: () => void router.push('/docs'),
// 		icon: <VscPackage size={20} />,
// 	},
// ];

export default function MyApp({ Component, pageProps }: AppProps) {
	// const router = useRouter();
	const { resolvedTheme } = useTheme();

	return (
		<>
			<Head>
				<title key="title">discord.js</title>
				<meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
				<meta name="theme-color" content={resolvedTheme === 'dark' ? '#161616' : '#ffffff'} />
			</Head>
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				value={{
					light: 'light',
					dark: 'dark',
				}}
			>
				<MantineProvider
					theme={{
						fontFamily: 'Inter',
						fontFamilyMonospace: 'JetBrains Mono',
						headings: {
							fontFamily: 'Inter',
						},
						colors: {
							blurple: [
								'#5865f2',
								'#5865f2',
								'#5865f2',
								'#5865f2',
								'#5865f2',
								'#5865f2',
								'#5865f2',
								'#5865f2',
								'#5865f2',
								'#5865f2',
							],
						},
						primaryColor: 'blurple',
					}}
					withCSSVariables
				>
					<NextProgress color="#0091ff" options={{ showSpinner: false }} />
					<Component {...pageProps} />
				</MantineProvider>
			</ThemeProvider>
		</>
	);
}
