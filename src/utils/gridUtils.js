export const STATUS_STYLES = {
  available: 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100 cursor-pointer',
  reserved: 'bg-amber-50 border-amber-300 text-amber-700 cursor-not-allowed',
  occupied: 'bg-emerald-50 border-emerald-300 text-emerald-700 cursor-not-allowed',
}

export const SELECTED_STYLE = 'bg-blue-600 border-blue-700 text-white'

// Checks whether the selected booths form one connected group
// (only up/down/left/right neighbours count — diagonals are not allowed)
export const isContiguousGroup = (booths) => {
  if (booths.length <= 1) return true
  const keySet = new Set(booths.map((b) => `${b.row}-${b.col}`))
  const visited = new Set()
  const stack = [booths[0]]
  visited.add(`${booths[0].row}-${booths[0].col}`)

  while (stack.length) {
    const cur = stack.pop()
    const neighbors = [
      [cur.row - 1, cur.col], [cur.row + 1, cur.col],
      [cur.row, cur.col - 1], [cur.row, cur.col + 1],
    ]
    for (const [r, c] of neighbors) {
      const key = `${r}-${c}`
      if (keySet.has(key) && !visited.has(key)) {
        visited.add(key)
        stack.push({ row: r, col: c })
      }
    }
  }
  return visited.size === booths.length
}