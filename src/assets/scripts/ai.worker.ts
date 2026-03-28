onmessage = (e: MessageEvent) => {
  const { nodes, difficulty, difficultyConfig, playerId, neutralId, gameTime, enemyCooldown } = e.data;

  const actions: { fromId: number; toId: number }[] = [];

  nodes.forEach((nodeA: any) => {
    if (nodeA.owner !== playerId && nodeA.owner !== neutralId) {
      if (nodeA.population < 10) return;

      let bestTargetId = -1;
      let maxScore = -Infinity;

      nodes.forEach((nodeB: any) => {
        if (nodeA.id === nodeB.id) return;

        const dx = nodeA.x - nodeB.x;
        const dy = nodeA.y - nodeB.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 350) return;

        let score = 0;

        if (difficulty === 'hard' && nodeB.owner === playerId) {
          score += 20;
        }

        if (nodeB.owner === neutralId) {
          score += 30 - nodeB.population;
        } else if (nodeB.owner === nodeA.owner) {
          const popDiff = nodeA.population - nodeB.population;
          score += popDiff;
        } else {
          if (nodeB.population < 10) {
            score += 15;
          }
        }

        score -= dist * 0.1;

        if (score > maxScore) {
          maxScore = score;
          bestTargetId = nodeB.id;
        }
      });

      const aggression = difficultyConfig[difficulty].aiAggression;
      if (bestTargetId !== -1 && (maxScore > 15 || Math.random() < aggression)) {
        if (gameTime - nodeA.lastTroopSentTime >= enemyCooldown) {
          actions.push({ fromId: nodeA.id, toId: bestTargetId });
        }
      }
    }
  });

  postMessage(actions);
};