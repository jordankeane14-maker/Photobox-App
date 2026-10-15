import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateStripDimensions,
  getFilterById,
  getFrameColorById,
  PHOTO_FILTERS,
  FRAME_COLORS,
} from './filterMath.ts';

test('PHOTO_FILTERS contains all 9 core photobox filters', () => {
  assert.equal(PHOTO_FILTERS.length >= 9, true);
  const filterIds = PHOTO_FILTERS.map((f) => f.id);
  assert.ok(filterIds.includes('normal'));
  assert.ok(filterIds.includes('bw'));
  assert.ok(filterIds.includes('vintage'));
  assert.ok(filterIds.includes('warm'));
  assert.ok(filterIds.includes('cool'));
  assert.ok(filterIds.includes('glow'));
  assert.ok(filterIds.includes('sepia'));
  assert.ok(filterIds.includes('cyber'));
  assert.ok(filterIds.includes('contrast'));
});

test('getFilterById fallback returns normal filter for invalid id', () => {
  // @ts-expect-error Testing invalid fallback
  const fallback = getFilterById('unknown_invalid_filter');
  assert.equal(fallback.id, 'normal');
});

test('getFrameColorById returns correct color and fallback', () => {
  const charcoal = getFrameColorById('charcoal');
  assert.equal(charcoal.id, 'charcoal');
  assert.equal(charcoal.hexBg, '#18181b');

  const fallback = getFrameColorById('unknown_color');
  assert.equal(fallback.id, 'charcoal');
});

test('calculateStripDimensions handles 1 to 4 vertical photos', () => {
  for (let count = 1; count <= 4; count++) {
    const dims = calculateStripDimensions('classic_strip', count);
    assert.equal(dims.columns, 1);
    assert.equal(dims.rows, count);
    assert.ok(dims.width > 0);
    assert.ok(dims.height > dims.width); // Vertical strip is taller than wide
    assert.equal(dims.photoWidth, dims.width - dims.padding * 2);
  }
});

test('calculateStripDimensions for 2x2 grid calculates 2 columns and 2 rows', () => {
  const dims = calculateStripDimensions('grid_2x2', 4);
  assert.equal(dims.columns, 2);
  assert.equal(dims.rows, 2);
  assert.ok(dims.width >= 1000);
  assert.ok(dims.photoWidth > 300);
  assert.ok(dims.photoHeight > 200);
});
