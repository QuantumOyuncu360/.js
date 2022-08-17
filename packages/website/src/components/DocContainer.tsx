import { Group, Stack, Title, Text, Box } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import type { ReactNode } from 'react';
import { VscListSelection, VscSymbolParameter } from 'react-icons/vsc';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { HyperlinkedText } from './HyperlinkedText';
import { Section } from './Section';
import { TypeParamTable } from './TypeParamTable';
import { TSDoc } from './tsdoc/TSDoc';
import type { DocItem } from '~/DocModel/DocItem';
import type { AnyDocNodeJSON } from '~/DocModel/comment/CommentNode';
import { generateIcon } from '~/util/icon';
import type { TokenDocumentation, TypeParameterData } from '~/util/parse.server';

export interface DocContainerProps {
	name: string;
	kind: string;
	excerpt: string;
	summary?: ReturnType<DocItem['toJSON']>['summary'];
	children?: ReactNode;
	extendsTokens?: TokenDocumentation[] | null;
	implementsTokens?: TokenDocumentation[][];
	typeParams?: TypeParameterData[];
	comment?: AnyDocNodeJSON | null;
}

export function DocContainer({
	name,
	kind,
	excerpt,
	summary,
	typeParams,
	children,
	extendsTokens,
	implementsTokens,
}: DocContainerProps) {
	const matches = useMediaQuery('(max-width: 768px)', true, { getInitialValueInEffect: false });

	return (
		<Stack>
			<Title order={2} ml="xs" className="break-all">
				<Group>
					{generateIcon(kind)}
					{name}
				</Group>
			</Title>

			<Section title="Summary" icon={<VscListSelection />} padded dense={matches}>
				{summary ? <TSDoc node={summary} /> : <Text>No summary provided.</Text>}
			</Section>

			<Box px="xs" pb="xs">
				<SyntaxHighlighter
					wrapLongLines
					language="typescript"
					style={vscDarkPlus}
					codeTagProps={{ style: { fontFamily: 'JetBrains Mono' } }}
				>
					{excerpt}
				</SyntaxHighlighter>
			</Box>

			{extendsTokens?.length ? (
				<Group noWrap>
					<Title order={3} ml="xs">
						Extends
					</Title>
					<Text className="font-mono break-all">
						<HyperlinkedText tokens={extendsTokens} />
					</Text>
				</Group>
			) : null}

			{implementsTokens?.length ? (
				<Group noWrap>
					<Title order={3} ml="xs">
						Implements
					</Title>
					<Text className="font-mono break-all">
						{implementsTokens.map((token, idx) => (
							<>
								<HyperlinkedText tokens={token} />
								{idx < implementsTokens.length - 1 ? ', ' : ''}
							</>
						))}
					</Text>
				</Group>
			) : null}

			<Stack>
				{typeParams?.length ? (
					<Section title="Type Parameters" icon={<VscSymbolParameter />} padded dense={matches} defaultClosed>
						<TypeParamTable data={typeParams} />
					</Section>
				) : null}
				<Stack>{children}</Stack>
			</Stack>
		</Stack>
	);
}
