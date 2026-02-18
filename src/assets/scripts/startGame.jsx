import { nodeCount, neutralId, playerId, minimumDistance } from "../../components/configs";

export function StartGame({ canvas }) {
    console.log('starting game...')
    console.log(canvas)

    const generateMap = () => {
        const newNodes = []
        let attempts = 0;
        while (newNodes.length < nodeCount && attempts < 2000) {
            attempts++;
            const margin = 60
            const x = margin + Math.random() * (canvas.innerWidth - margin * 2);
            const y = margin + Math.random() * (canvas.innerHeight - margin * 2);
            let valid = true
            for (let n of newNodes) {
                if (Math.hypot(n.x - x, n.y - y) < minimumDistance) {
                    valid = false
                    break
                }
            }
            if (valid) {
                let owner = neutralId
                let pop = 10 + Math.floor(Math.random() * 25)
                if (newNodes.length === 0) {
                    owner = playerId
                    pop = 60
                }
                else if (newNodes.length <= 10) {
                    owner = newNodes.length
                    pop = 40
                }
                newNodes.push((newNodes.length, x, y, owner, pop));
            }
        }
        return newNodes
    }

    return generateMap()

}