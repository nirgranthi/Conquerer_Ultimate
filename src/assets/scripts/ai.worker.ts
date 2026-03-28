import { Node } from "../../components/configs";

onmessage = (e: MessageEvent) => {
  const { nodes, difficulty, difficultyConfig, playerId, neutralId, gameTime, enemyCooldown, equalityMode } = e.data;


  const actions: { fromId: number; toId: number }[] = [];

  nodes.forEach((nodeA: Node) => {
    if (nodeA.owner !== playerId && nodeA.owner !== neutralId) {
      if (nodeA.population < 10) return;

      let bestTargetId = -1;
      let maxScore = -Infinity;

      nodes.forEach((nodeB: Node) => {
        if (nodeA.id === nodeB.id) return;

        const dx = nodeA.x - nodeB.x;
        const dy = nodeA.y - nodeB.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 350) return;

        let score = 0;

        if (!equalityMode && difficulty === 'hard' && nodeB.owner === playerId) {
          score += 20;
        }

        if (nodeB.owner !== playerId) {
          const popDiff = nodeA.population - nodeB.population;
          let allyScore = 0;
          if (nodeB.population < 100) {
            allyScore = popDiff;
          } else if (nodeB.population < 150) {
            allyScore = popDiff * 0.75;
          } else if (nodeB.population < 200) {
            allyScore = popDiff * 0.4;
          }
          score += Math.min(allyScore, 30);
        } else {
          score += 10 + (nodeA.population - nodeB.population) * 0.5;
          if (nodeB.population < 10) {
            score += 20;
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