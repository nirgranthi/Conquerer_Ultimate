import { Difficulty } from "../assets/GameContext";

const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#84CC16', '#f40e6eff', '#14B8A6', '#4B5563'];
const neutralId = 11;
const playerId = 0;

const nodeCount = 40;
const minimumDistance = 70;
const maxPopulation = 200;
const growthRate = 1.3;
export const spyGrowthRate = 1.5;
export let troopSpeed = 2.8;
export let chaosMode = false;
export let imposterMode = false;
export let monopolyMode = false;
export const monopolyLuckyNodePopulation = 150
export let equalityMode = false;
export let spyMode = false;
export let spyOwnerId: number = -1;
export let spectatorMode = false;

const troopSize = 4;
const nodeRadius = 24;
const aiStartDelay = 7;
const enemyCooldown = 3;
const maxTroopPoolSize = 2500;

export let playerShadowColor = '#60A5FA';
export let playerStrokeColor = '#BFDBFE';

export function setPlayerColorVar(base: string, shadow: string, stroke: string) {
    const existingIndex = colors.indexOf(base);
    if (existingIndex !== -1 && existingIndex !== playerId) {
        colors[existingIndex] = colors[playerId];
    }
    colors[playerId] = base;
    playerShadowColor = shadow;
    playerStrokeColor = stroke;
}

export function setTroopSpeedVar(speed: number) {
    troopSpeed = speed;
}

export function setChaosModeVar(val: boolean) {
    chaosMode = val;
}

export function setImposterModeVar(val: boolean) {
    imposterMode = val;
}

export function setMonopolyModeVar(val: boolean) {
    monopolyMode = val;
}

export function setEqualityModeVar(val: boolean) {
    equalityMode = val;
}

export function setSpyModeVar(val: boolean) {
    spyMode = val;
    if (!val) spyOwnerId = -1;
}

export function setSpyOwnerIdVar(id: number) {
    spyOwnerId = id;
}

export function setSpectatorModeVar(val: boolean) {
    spectatorMode = val;
}


const difficultyConfig = {
    easy: { aiInterval: 2000, aiAggression: 0.3, growthMod: 0.4 },
    medium: { aiInterval: 1000, aiAggression: 0.7, growthMod: 0.7 },
    hard: { aiInterval: 400, aiAggression: 0.9, growthMod: 0.8 }
};

class Node {
    id: number;
    x: number;
    y: number;
    owner: number;
    population: number;
    radius: number;
    maxPop: number;
    growthTimer: number;
    pulse: number;
    lastTroopSentTime: number;
    queuedTroops: number;

    constructor(id: number, x: number, y: number, ownerId: number, pop: number) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.owner = ownerId;
        this.population = pop;
        this.radius = nodeRadius;
        this.maxPop = maxPopulation;
        this.growthTimer = 0;
        this.pulse = Math.random() * Math.PI;
        this.lastTroopSentTime = 0;
        this.queuedTroops = 0;
    }
    update(dt: number, difficulty: Difficulty, globalPopRef: React.RefObject<Record<number, number>>) {
        let rate = growthRate;
        if (this.owner !== playerId && this.owner !== neutralId) { rate *= difficultyConfig[difficulty].growthMod }
        if (spyMode && spyOwnerId === this.owner && this.owner !== playerId && this.owner !== neutralId) {
            rate *= spyGrowthRate;
        }
        if (this.owner !== neutralId && this.population < this.maxPop) {
            this.growthTimer += dt
            if (this.growthTimer > (1 / rate)) {
                this.population++
                globalPopRef.current[this.owner] = (globalPopRef.current[this.owner] || 0) + 1;
                this.growthTimer = 0
            }
        }
        this.pulse += dt * 2
    }
    drawBackground(ctx: CanvasRenderingContext2D) {
        ctx.beginPath()
        const r = this.radius;
        ctx.arc(this.x, this.y, r, 0, Math.PI * 2)
        const isEnemy = this.owner !== playerId && this.owner !== neutralId;
        const apparentOwner = (isEnemy && imposterMode) ? playerId : this.owner;
        ctx.fillStyle = colors[apparentOwner]
        if (apparentOwner === playerId) {
            ctx.shadowBlur = 20
            ctx.shadowColor = playerShadowColor
        }
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.lineWidth = 3
        ctx.strokeStyle = (apparentOwner === neutralId)
            ? '#6B7280'
            : '#ffffff'
        if (apparentOwner === playerId) { ctx.strokeStyle = playerStrokeColor }
        ctx.stroke()
        ctx.closePath()
    }

    drawForeground(ctx: CanvasRenderingContext2D, dragSelected: Node[]) {
        const isEnemy = this.owner !== playerId && this.owner !== neutralId;
        const apparentOwner = (isEnemy && imposterMode) ? playerId : this.owner;
        if (apparentOwner === playerId) {
            ctx.beginPath()
            ctx.arc(this.x, this.y, this.radius + Math.sin(this.pulse) * 1.5, 0, Math.PI * 2)
            ctx.strokeStyle = playerShadowColor
            ctx.lineWidth = 1.5
            ctx.stroke()
            ctx.closePath()
        }

        if (dragSelected.includes(this)) {
            ctx.beginPath()
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
            ctx.strokeStyle = '#FCD34D'
            ctx.lineWidth = 5
            ctx.stroke()
            ctx.closePath()
        }
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 13px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(String(Math.floor(this.population)), this.x, this.y)
    }
}

class Troop {
    owner: number = 0;
    x: number = 0;
    y: number = 0;
    target!: Node;
    isPlayer: boolean = false;
    vx: number = 0;
    vy: number = 0;
    dead: boolean = true;
    color: string = '';
    targetRadiusSq: number = 0;
    steeringTimer: number = 0;
    lifeTime: number = 0;
    ownerMask: number = 0;

    constructor() { }

    init(owner: number, startNode: Node, targetNode: Node) {
        this.owner = owner;
        this.x = startNode.x;
        this.y = startNode.y;
        this.target = targetNode;
        this.isPlayer = (owner === playerId);
        const angle = Math.atan2(targetNode.y - startNode.y, targetNode.x - startNode.x);
        const spread = (Math.random() - 0.5) * (chaosMode ? 0.6 : 0.18);
        this.vx = Math.cos(angle + spread) * troopSpeed;
        this.vy = Math.sin(angle + spread) * troopSpeed;
        this.dead = false;
        const isEnemy = this.owner !== playerId && this.owner !== neutralId;
        const apparentOwner = (isEnemy && imposterMode) ? playerId : this.owner;
        this.color = colors[apparentOwner];
        this.targetRadiusSq = targetNode.radius * targetNode.radius;
        this.steeringTimer = Math.floor(Math.random() * 5);
        this.lifeTime = 0;
        this.ownerMask = 1 << owner;
    }
    update(dt: number, createExplosion: (x: number, y: number, color: string, count: number) => void, globalPopRef: React.RefObject<Record<number, number>>) {
        this.lifeTime += dt * 1000;
        this.x += this.vx
        this.y += this.vy
        const dx = this.target.x - this.x
        const dy = this.target.y - this.y
        const distSq = dx * dx + dy * dy

        if (!chaosMode && distSq < 400) {
            this.steeringTimer = 1;
            const dist = Math.sqrt(distSq) || 1;
            this.vx = (dx / dist) * troopSpeed;
            this.vy = (dy / dist) * troopSpeed;
        } else if (distSq > 100 && this.lifeTime > 500) {
            this.steeringTimer++;
            if (this.steeringTimer % 3 === 0) {
                const absDx = Math.abs(dx);
                const absDy = Math.abs(dy);
                const approxDist = Math.max(absDx, absDy) + 0.4 * Math.min(absDx, absDy);
                if (approxDist > 0) {
                    this.vx += (dx / approxDist * 0.15)
                    this.vy += (dy / approxDist * 0.15)
                }
                const speedSq = this.vx * this.vx + this.vy * this.vy
                const maxSpeedSq = troopSpeed * troopSpeed;
                if (speedSq > maxSpeedSq) {
                    const speedRatio = troopSpeed / Math.sqrt(speedSq)
                    this.vx *= speedRatio;
                    this.vy *= speedRatio;
                }
            }
        }
        if (distSq < this.targetRadiusSq) {
            this.hitTarget(createExplosion, globalPopRef)
            this.dead = true
        }
    }
    hitTarget(createExplosion: (x: number, y: number, color: string, count: number) => void, globalPopRef: React.MutableRefObject<Record<number, number>>) {
        if (this.target.owner === this.owner) {
            this.target.population++
        } else {
            this.target.population--
            globalPopRef.current[this.target.owner] = Math.max(0, (globalPopRef.current[this.target.owner] || 0) - 1);
            if (this.target.population <= 0) {
                this.target.owner = this.owner
                this.target.population = 1
                createExplosion(this.target.x, this.target.y, colors[this.owner], 15)
            } else {
                globalPopRef.current[this.owner] = Math.max(0, (globalPopRef.current[this.owner] || 0) - 1);
            }
        }
    }
    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath()
        ctx.arc(this.x, this.y, troopSize, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
        const isEnemy = this.owner !== playerId && this.owner !== neutralId;
        const apparentOwner = (isEnemy && imposterMode) ? playerId : this.owner;
        if (apparentOwner === playerId) {
            ctx.lineWidth = 1.5
            ctx.strokeStyle = '#ffffff'
            ctx.stroke()
        }
        ctx.closePath()
    }
}

class Particle {
    x: number = 0;
    y: number = 0;
    color: string = '';
    vx: number = 0;
    vy: number = 0;
    life: number = 0;
    decay: number = 0;

    constructor() { }

    init(x: number, y: number, color: string) {
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
    draw(ctx: CanvasRenderingContext2D) {
        ctx.globalAlpha = Math.max(0, this.life)
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1.0
    }
}

export { Node, Troop, Particle, colors, neutralId, playerId, nodeCount, minimumDistance, troopSize, aiStartDelay, difficultyConfig, enemyCooldown, maxTroopPoolSize }
