import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Separator } from './Seperator';
import { TypeParamTable } from './TypeParamTable';
import { generateIcon } from '~/util/icon';
import type { TypeParameterData } from '~/util/parse.server';

export interface DocContainerProps {
	name: string;
	kind: string;
	excerpt: string;
	summary?: string | null;
	children?: JSX.Element | JSX.Element[];
	typeParams?: TypeParameterData[];
}

export function DocContainer({ name, kind, excerpt, summary, typeParams, children }: DocContainerProps) {
	return (
		<div className="px-10">
			<h1 className="font-mono flex items-center content-center break-all">
				{generateIcon(kind, 'mr-2')}
				{name}
			</h1>
			<div>
				<SyntaxHighlighter
					wrapLines
					wrapLongLines
					language="typescript"
					style={vs}
					codeTagProps={{ style: { fontFamily: 'JetBrains Mono' } }}
				>
					{excerpt}
				</SyntaxHighlighter>
			</div>
			<h2>Summary</h2>
			<p className="color-slate-500">{summary ?? 'No summary provided.'}</p>
			<Separator />
			{typeParams?.length ? (
				<>
					<h2>Type Parameters</h2>
					<TypeParamTable data={typeParams} className="mb-5 p-3" />
					<Separator />
				</>
			) : null}
			<div>{children}</div>
		</div>
	);
}
