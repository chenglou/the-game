function hasAtLeast3InSurrounding(map, tile) {
  var x = tile[0];
  var y = tile[1];
  var w = map[0].length;
  var h = map.length;

  var accum = 0;
  // 4 sides
  if (y > 0 && map[y-1][x] === 1) accum++;
  if (y < h-1 && map[y+1][x] === 1) accum++;
  if (x > 0 && map[y][x-1] === 1) accum++;
  if (x < w-1 && map[y][x+1] === 1) accum++;
  // corners
  if (y % 2 === 0) {
    if (x > 0 && y < h-1 && map[y+1][x-1] === 1) accum++;
    if (x < w-1 && y < h-1 && map[y+1][x+1] === 1) accum++;
  } else {
    if (x > 0 && map[y][x-1] === 1) accum++;
    if (x < w-1 && map[y][x+1] === 1) accum++;
  }

  return accum;
}
