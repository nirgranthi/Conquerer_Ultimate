const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#84CC16', '#f40e6eff', '#14B8A6', '#4B5563'];
const neutralId = 11;
const playerId = 0;

const nodeCount = 40;
const minimumDistance = 70;
const maxPopulation = 200;
const growthRate = 1.5;
const troopSpeed = 2.8;
const troopSize = 4;
const nodeRadius = 24;
const aiStartDelay = 5;

const difficultyConfig = {
    easy: { aiInterval: 2000, aiAggression: 0.3, growthMod: 0.4 },
    medium: { aiInterval: 1000, aiAggression: 0.6, growthMod: 1.0 },
    hard: { aiInterval: 400, aiAggression: 0.95, growthMod: 1.2 }
};

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
    update(dt, difficulty) {
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
    draw(ctx) {
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
        if (this.owner === playerId) { ctx.strokeStyle = '#BFDBFE' }
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

class Troop {
    constructor(owner, startNode, targetNode) {
        this.owner = owner
        this.x = startNode.x
        this.y = startNode.y
        this.target = targetNode
        this.isPlayer = (owner === playerId)
        const angle = Math.atan2(targetNode.y - startNode.y, targetNode.x - startNode.x)
        const spread = (Math.random() - 0.5) * 0.6
        this.vx = Math.cos(angle + spread) * troopSpeed
        this.vy = Math.sin(angle + spread) * troopSpeed
        this.dead = false
        this.color = colors[this.owner]
    }
    update() {
        this.x += this.vx
        this.y += this.vy
        const dx = this.target.x - this.x
        const dy = this.target.y - this.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist > 10) {
            this.vx += (dx / dist * 0.15)
            this.vy += (dy / dist * 0.15)
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
            this.vx = (this.vx / speed) * troopSpeed
            this.vy = (this.vy / speed) * troopSpeed;
        }
        if (dist < this.target.radius) {
            this.hitTarget()
            this.dead = true
        }
    }
    hitTarget(createExplosion) {
        if (this.target.owner === this.owner) this.target.population++
        else {
            this.target.population--
            if (this.target.population <= 0) {
                this.target.owner = this.owner
                this.target.population = 1
                createExplosion(this.target.x, this.target.y, colors[this.owner], 15)
            }
        }
    }
    draw(ctx) {
        ctx.beginPath()
        ctx.arc(this.x, this.y, troopSize, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
        if (this.isPlayer) {
            ctx.lineWidth = 1.5
            ctx.strokeStyle = '#ffffff'
            ctx.stroke()
        }
        ctx.closePath()
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x
        this.y = y
        this.color = color
        const angle = Math.random() * Math.PI * 2
        const speed = Math.random() * 3
        this.vx = Math.cos(angle) * speed
        this.vy = Math.sin(angle) * speed
        this.life = 1.0
        this.decay = 0.03 + Math.random() * 0.03
    }
    update() {
        this.x += this.vx
        this.y += this.vy
        this.life -= this.decay
    }
    draw(ctx) {
        ctx.globalAlpha = Math.max(0, this.life)
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1.0
    }
}

export { Node, Troop, Particle, colors, neutralId, playerId, nodeCount, minimumDistance, maxPopulation, growthRate, troopSpeed, troopSize, nodeRadius, aiStartDelay, difficultyConfig }
