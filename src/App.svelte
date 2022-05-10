<script lang="ts">
	import { SingaporeMahjong, StandardMahjong, StandardTile, Tile, WindTile } from './tiles';
	import { Hand, SeatedPlayer, Wall } from './game-state';
	import { getMatchingCombinations } from './combis';
	import { TileDebug } from './tile-utils';

	const tileSet = [...SingaporeMahjong.TILE_SET];

	const currentHand = new Hand(StandardMahjong.SUIT_EAST);
	const player = currentHand.players[0];
	const otherPlayers = currentHand.players.slice(1);

	export let flowers = player.flowers;
	export let hand = player.hand;
	export let hasFlowers = player.hasFlowerInHand();
	export let combinations = getMatchingCombinations(player.hand);

	console.log(combinations);

	const updateState = () => {
		flowers = player.flowers;
		hand = player.hand;
		hasFlowers = player.hasFlowerInHand();
		combinations = getMatchingCombinations(player.hand);
	}

	export const onTileClicked = (tile: Tile, index: number) => {
		if (tile instanceof StandardTile) {
			player.discard(index);
			player.drawFromWall();
		} else {
			player.revealFlowerAndDrawReplacement();
		}
		updateState();
	}
</script>

<main>
	<p>Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.</p>
	<h3>Flower hand</h3>
	<div id="flowers">
		{flowers.map(flower => flower.toString()).join('')}
	</div>
	<h3>Main hand</h3>
	<div id="hand">
		{#each hand as tile, i}
			<button disabled={tile instanceof StandardTile && hasFlowers} on:click={() => onTileClicked(tile, i)}>
				{tile.toString()}
			</button>
		{/each}
	</div>
	<div id="actions">
		{#if hand.length < 14}
			<button on:click={() => {player.drawFromWall(); hand = player.hand; flowers = player.flowers;}}>
				Draw
			</button>
		{/if}
	</div>
	<h3>Other's hands</h3>
	{#each otherPlayers as player}
	
		<div id="hand" style="display: flex; gap = 16px">
			{#each player.hand as tile, i}
				<div>
					{tile.toString()}
				</div>
			{/each}
		</div>
		
	{/each}
	<div id="actions">
		{#if hand.length < 14}
			<button on:click={() => {player.drawFromWall(); hand = player.hand; flowers = player.flowers;}}>
				Draw
			</button>
		{/if}
	</div>
	<h3>Combinations in hand</h3>
	<div id="combinations">
		{#each combinations as combi}
			<div>
				{combi.name}
				<div style="display: flex; gap: 10px">
					{#each combi.melds as meld}
						{meld.toString()}
					{/each}
				</div>
			</div>

		{/each}
	</div>

</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	#hand, #flowers {
		font-size: 2em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>