import type { PropsWithChildren } from 'react';
import { VscWarning } from 'react-icons/vsc';

export function Caution({ children }: PropsWithChildren<{}>) {
	return (
		<div className="rounded border border-blue-500 p-4">
			<div className="flex flex-row place-items-center gap-4">
				<span className="text-blue-500">
					<VscWarning size={20} />
				</span>
				<div className="flex flex-col gap-2 text-sm">
					<span className="font-semibold text-blue-500">Caution</span>
					{children}
				</div>
			</div>
		</div>
	);
}
