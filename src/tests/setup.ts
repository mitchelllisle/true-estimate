import '@testing-library/jest-dom';

// jsdom doesn't implement the Web Animations API; stub it so Svelte transitions
// (fade, fly) don't throw when rendering components in tests.
if (typeof Element !== 'undefined' && !Element.prototype.animate) {
	Element.prototype.animate = () =>
		({
			finished: Promise.resolve({} as Animation),
			cancel: () => {},
			pause: () => {},
			play: () => {},
			onfinish: null,
			oncancel: null,
			currentTime: 0,
			effect: null,
			id: '',
			pending: false,
			playState: 'finished',
			playbackRate: 1,
			ready: Promise.resolve({} as Animation),
			replaceState: 'active',
			startTime: 0,
			timeline: null,
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => true,
			commitStyles: () => {},
			finish: () => {},
				persist: () => {},
			reverse: () => {},
			updatePlaybackRate: () => {}
		}) as unknown as Animation;
}
