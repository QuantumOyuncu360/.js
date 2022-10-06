export function DiscordMessageEmbedAuthor({ avatar, username }: { avatar: string; username: string }) {
	return (
		<div className="mt-2 flex place-items-center">
			<img className="mr-2 h-6 w-6 select-none rounded-full" src={avatar} />
			<span className="text-sm font-medium hover:underline">{username}</span>
		</div>
	);
}
