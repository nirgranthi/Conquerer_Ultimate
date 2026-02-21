import { Node, Troop, Particle, nodeCount, neutralId, playerId, minimumDistance, troopSize, difficultyConfig, aiStartDelay } from "../../components/configs.js";


let previousFrameTime = 0
let currentFrameTime = 0
let particles = []
let gameTime = 0
let aiTimer = 0

function StartGame({ canvas, difficulty, ctx, gameState, isDraggingRef, nodesRef, sendTroopsRef, troopsRef, dragSelectedRef, dragCurrentRef, isWonRef }) {

    const sendTroops = (selectedNode, target, percent) => {
        if (selectedNode.population < 2) return;
        let noOfTroopsToSend = Math.floor(selectedNode.population * percent)
        selectedNode -= noOfTroopsToSend
        for (let i = 0; i < noOfTroopsToSend; i++) { setTimeout(() => { if (gameState === 'playing') { troopsRef.current.push(new Troop(selectedNode.owner, selectedNode, target)) } }), i * 30 }
    }
    sendTroopsRef.current = sendTroops

    /* jo cE use krre use liljo */
    const createExplosion = (x, y, color, count) => {
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(x, y, color))
        }
    }

    const checkWinCondition = () => {
        const owners = new Set(nodesRef.current.map(node => node.owner))
        if (!owners.has(playerId) && troopsRef.current.some(troop => troop.owner === playerId)) {isWonRef.current = false}
        else if ( owners.size === 1 && owners.has(playerId)) {isWonRef.current = true}
        else if ( owners.size === 2 && owners.has(playerId) && owners.has(neutralId) && !troopsRef.current.some(troop => troop.owner !== playerId)) {isWonRef.current = true}
    }

    const runSmartAi = (settings) => {
        nodesRef.current.forEach(nodeA => {
            if (nodeA.owner !== playerId && nodeA.owner !== neutralId) {
                if (nodeA.population < 10) return
                let targets = []
                nodesRef.current.forEach(nodeB => {
                    if (nodeA.id === nodeB.id) return
                    const dist = Math.hypot(nodeA.x-nodeB.x, nodeA.y-nodeB.y)
                    if (dist > 350) return
                    let score = 0
                    if (nodeB.owner === neutralId) {
                        score -= 50 - nodeB.population
                    } else if (nodeB.owner === nodeA.owner) {
                        let popDiff = nodeA.population-nodeB.population
                        score += popDiff * 2
                        if (difficulty === 'hard' && nodeB.owner === playerId) {score += 120}
                    } else { if (nodeB.population < 10) {score += 20}}
                    score -= dist * 0.1
                    targets.push({node: nodeB, score: score})
                })
                targets.sort((a, b) => {b.score - a.score})
                if (targets.length > 0 && (targets[0].score > 15 || Math.random() < settings.aiAggresion)) { sendTroops(nodeA, targets[0].node, 0.5)}
            }
        })
    }

    const update = (dt) => {
        gameTime += dt
        nodesRef.current.forEach(node => node.update(dt, difficulty))
        troopsRef.current.forEach(troop => troop.update)
        troopsRef.current = troopsRef.current.filter(troop => !troop.dead)
        /* troopsize */
        /* using for loop because we have to return */
        for (let i = 0; i < troopsRef.current.length; i++) {
            const troopA = troopsRef.current[i]
            if (!troopA.dead) {
                for (let j = i + 1; j < troopsRef.current.length; j++) {
                    const troopB = troopsRef.current[j]
                    if (!troopB.dead && troopA.owner !== troopB.owner) {
                        if (Math.hypot(troopA.x - troopB.x, troopA.y - troopB.y) < troopSize * 2) {
                            troopA.dead = true
                            troopB.dead = true
                            createExplosion(troopA.x + troopB, troopA.y + troopB.y, '#FFF', 2)
                            return
                        }
                    }
                }
            }
        }
        particles.forEach(particle => particle.update())
        particles.filter(particle => particle.life > 0)
        aiTimer += dt * 1000
        const difficultySettings = difficultyConfig[difficulty]
        if (gameTime > aiStartDelay && aiTimer > difficultySettings.aiInterval) {
            runSmartAi(difficultySettings)
            aiTimer = 0
        }
        checkWinCondition()
    }

    const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.lineWidth = 1
        ctx.strokeStyle = '#374151'
        ctx.beginPath()
        nodesRef.current.forEach((nodeA, i) => {
            nodesRef.current.slice(i + 1).forEach((nodeB) => {
                const d = Math.hypot(nodeA.x - nodeB.x, nodeA.y - nodeB.y)
                if (d < 200) {
                    ctx.moveTo(nodeA.x, nodeA.y)
                    ctx.lineTo(nodeB.x, nodeB.y)
                }
                ctx.stroke()
            })
        })
        nodesRef.current.forEach(node => node.draw(ctx, dragSelectedRef.current))
        if (gameTime < 3 && gameState === 'playing') {
            const playerNode = nodesRef.current.find((node) => node.owner === playerId)
            ctx.save()
            ctx.translate(playerNode.x, playerNode.y - 50 - Math.sin(gameTime * 5) * 10)
            ctx.fillStyle = '#FCD34D'
            ctx.beginPath()
            ctx.moveTo(-10, 0)
            ctx.lineTo(10, 0)
            ctx.lineTo(0, 20)
            ctx.fill()
            ctx.font = "bold 16px sans-serif"
            ctx.fillText("YOU", 0, -10)
            ctx.restore()
        }
        if (isDraggingRef.current && dragSelectedRef.current.length > 0) {
            ctx.beginPath()
            ctx.lineWidth = 4
            ctx.strokeStyle = '#FCD34D'
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'
            ctx.setLineDash([10, 10])
            ctx.moveTo(dragSelectedRef.current[0].x, dragSelectedRef.current[0].y)
            dragSelectedRef.current.forEach(selectedNode => {
                ctx.lineTo(selectedNode.x, selectedNode.y)
                ctx.lineTo(dragCurrentRef.current.x, dragCurrentRef.current.y)
                ctx.stroke()
                ctx.setLineDash([])
                ctx.closePath()
            })
        }
        troopsRef.current.forEach(troop => troop.draw(ctx))
        particles.forEach(particle => particle.draw(ctx))
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
        nodesRef.current = newNodes
    }

    const animate = () => {
        if (gameState !== 'playing') return;
        currentFrameTime = performance.now()
        const dt = (currentFrameTime - previousFrameTime) / 1000
        update(dt)
        draw()
        previousFrameTime = currentFrameTime
        requestAnimationFrame(animate)
    }

    const main = () => {
        generateMap()
        previousFrameTime = performance.now()
        animate()
    }
    main()
}

export { StartGame }