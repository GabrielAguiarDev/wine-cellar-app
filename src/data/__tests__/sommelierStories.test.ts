import { describe, expect, it } from '@jest/globals';

import { mmss } from '@utils/format';

import { specials } from '../selectors';
import { sommelierStory, storySeconds } from '../sommelierStories';
import { WINES } from '../wines';

describe('sommelierStory', () => {
  it('a soma dos trechos é o videoDuration do destaque', () => {
    const featured = specials();
    expect(featured.length).toBeGreaterThan(0);

    for (const wine of featured) {
      const total = storySeconds(sommelierStory(wine));
      expect(mmss(total)).toBe(wine.videoDuration);
    }
  });

  it('todo vinho tem roteiro, mesmo sem texto escrito à mão', () => {
    for (const wine of WINES) {
      const chapters = sommelierStory(wine);
      expect(chapters.length).toBeGreaterThan(1);
      for (const chapter of chapters) {
        expect(chapter.seconds).toBeGreaterThan(0);
        expect(chapter.caption).not.toBe('');
        expect(chapter.cue).not.toBe('');
      }
    }
  });
});
