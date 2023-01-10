'use server';

import type { ApiMethod, ApiMethodSignature } from '@microsoft/api-extractor-model';
import { MethodDocumentation } from './MethodDocumentation';
import { MethodHeader } from './MethodName';
import { OverloadSwitcher } from './OverloadSwitcher';

export function Method({ method }: { method: ApiMethod | ApiMethodSignature }) {
	if (method.getMergedSiblings().length > 1) {
		// We have overloads, use the overload switcher, but render
		// each overload node on the server.
		const overloads = method
			.getMergedSiblings()
			.map((sibling, idx) => <MethodDocumentation key={idx} method={sibling as ApiMethod | ApiMethodSignature} />);

		return (
			<OverloadSwitcher overloads={overloads}>
				<MethodHeader method={method} />
			</OverloadSwitcher>
		);
	}

	// We have just a single method, render it on the server.
	return (
		<>
			<MethodHeader method={method} />
			<MethodDocumentation method={method} />
		</>
	);
}
