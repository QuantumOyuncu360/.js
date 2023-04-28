export interface IDiscordMessageAuthor {
	avatar: string;
	bot?:
		| boolean
		| {
				verified: boolean;
		  };
	color?: string;
	time: string;
	username: string;
}

export function DiscordMessageAuthor({ avatar, bot, color, time, username }: IDiscordMessageAuthor) {
	return (
		<>
			<img
				alt={`${username}'s avatar`}
				className="absolute left-[16px] mt-0.5 h-10 w-10 cursor-pointer select-none rounded-full"
				src={avatar}
			/>
			<h2 className="m-0 text-size-inherit font-medium leading-snug" id="user-info">
				<span className="mr-1" id="username">
					<span
						className="cursor-pointer text-base font-medium hover:underline"
						{...(color && { className: `text-${color}` })}
					>
						{username}
					</span>
					{bot ? (
						<span className="relative top-1 ml-1 rounded bg-blurple px-1 vertical-top text-xs text-white" id="bot">
							{typeof bot === 'boolean' || !bot?.verified ? 'BOT' : '✓ BOT'}
						</span>
					) : null}
				</span>
				<span className="ml-1 cursor-default text-xs leading-snug text-[rgb(163_166_170)]" id="time">
					{time}
				</span>
			</h2>
		</>
	);
}
