import { nodeCount, growthRate, colors, difficultyConfig, neutralId, playerId, minimumDistance, nodeRadius, maxPopulation } from "../../components/configs";

export function StartGame({ canvas, difficulty, ctx }) {

    
    console.log(ctx.fillStyle)

    class Node {
        constructor(id, x, y, ownerId, pop) {
            this.id = id;
            this.x = x;
            this.y = y;
            this.owner = ownerId;
            this.population = pop;
            this.radius = nodeRadius;
            this.maxPop = maxPopulation;
            this.growthTimer = 0;
            this.pulse = Math.random() * Math.PI;
        }
        update(dt) {
            let rate = growthRate;
            if (this.owner !== playerId && this.owner !== neutralId) { rate *= difficultyConfig[difficulty].growthMod }
            if (this.owner !== neutralId && this.population < this.maxPop) {
                this.growthTimer += dt
                if (this.growthTimer > (1 / rate)) {
                    this.population++
                    this.growthTimer = 0
                }
            }
            this.pulse += dt * 2
        }
        draw() {
            ctx.beginPath();
            const r = this.owner === playerId
                ? this.radius + Math.sin(this.pulse) * 1.5
                : this.radius;
            ctx.arc(this.x, this.y, r, 0, Math.PI * 2)
            ctx.fillStyle = colors[this.owner]
            if (this.owner === playerId) {
                ctx.shadowBlur = 20
                ctx.shadowColor = '#60A5FA'
            }
            else {
                ctx.shadowBlur = 10
                ctx.shadowColor = 'rgba(0,0,0,0.3)'
            }
            ctx.fill()
            ctx.shadowBlur = 0
            ctx.lineWidth = 3
            ctx.strokeStyle = (this.owner === neutralId)
                ? '#6B7280'
                : '#ffffff'
            if (this.owner === playerId) {ctx.strokeStyle = '#BFDBFE'}
            /* if (dragSources.includes(this)) {
                ctx.strokeStyle = '#FCD34D'
                ctx.lineWidth = 5
            } */
            ctx.stroke()
            ctx.closePath()
            ctx.fillStyle = '#fff'
            ctx.font = 'bold 13px sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(Math.floor(this.population), this.x, this.y)
        }
    }

    const generateMap = () => {
        const newNodes = []
        let attempts = 0;
        while (newNodes.length < nodeCount && attempts < 2000) {
            attempts++;
            const margin = 60
            const x = margin + Math.random() * (canvas.width - margin * 2);
            const y = margin + Math.random() * (canvas.height - margin * 2);
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
                newNodes.push(new Node(newNodes.length, Math.floor(x), Math.floor(y), owner, pop));
            }
        }
        return newNodes
    }

    return generateMap()

}