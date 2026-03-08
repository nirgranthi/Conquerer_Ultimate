import { Node, Troop, Particle, nodeCount, neutralId, playerId, minimumDistance, troopSize, difficultyConfig, aiStartDelay } from "../../components/configs.ts";
import { useGameContext } from "../GameContext.tsx";


function StartGame({ canvas, difficulty, ctx, setGameState, isDraggingRef, nodesRef, troopsRef, dragSelectedRef, dragCurrentRef, setIsWon, handleDoubleTapRef }) {
    let previousFrameTime = 0
    let currentFrameTime = 0
    let particles = []
    let gameTime = 0
    let aiTimer = 0
    let animationId
    let connections = []

    const { gameState } = useGameContext()

    const createExplosion = (x, y, color, count) => {
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(x, y, color))
        }
    }

    const globalAssault = (targetNode) => {
        nodesRef.current.forEach(node => {
            if (node.owner === playerId && node !== targetNode) {
                sendTroops(node, targetNode, 0.5)
                createExplosion(node.x, node.y, '#3B82F6', 5)
            }
        })
        createExplosion(targetNode.x, targetNode.y, '#FF0000', 10)
    }

    const handleDoubleTap = (x: number, y: number) => {
        const targetNode = nodesRef.current.find(node => ((node.x - x) ** 2 + (node.y - y) ** 2) < (node.radius * 1.5) ** 2)
        if (targetNode) {
            globalAssault(targetNode)
            createExplosion(x, y, '#fff', 5)
        }
    }
    handleDoubleTapRef.current = handleDoubleTap

    const checkWinCondition = () => {
        const owners = new Set(nodesRef.current.map(node => node.owner))
        let won = null
        if (!owners.has(playerId) && !troopsRef.current.some(troop => troop.owner === playerId)) {
            won = false
        } else if (owners.size === 1 && owners.has(playerId)) {
            won = true
        } else if (owners.size === 2 && owners.has(playerId) && owners.has(neutralId) && !troopsRef.current.some(troop => troop.owner !== playerId)) {
            won = true
        }
        if (won !== null && gameState === 'playing') {
            setIsWon(won)
            setGameState('gameover')
        }
    }

    const runSmartAi = (settings) => {
        nodesRef.current.forEach(nodeA => {
            if (nodeA.owner !== playerId && nodeA.owner !== neutralId) {
                if (nodeA.population < 10) return
                let targets = []
                nodesRef.current.forEach(nodeB => {
                    if (nodeA.id === nodeB.id) return
                    const dist = Math.hypot(nodeA.x - nodeB.x, nodeA.y - nodeB.y)
                    if (dist > 350) return
                    let score = 0
                    if (difficulty === 'hard' && nodeB.owner === playerId) { score += 20 }
                    if (nodeB.owner === neutralId) {
                        score += 30 - nodeB.population
                    } else if (nodeB.owner === nodeA.owner) {
                        let popDiff = nodeA.population - nodeB.population
                        score += popDiff * 2
                    } else { if (nodeB.population < 10) { score += 15 } }
                    score -= dist * 0.1
                    targets.push({ node: nodeB, score: score })
                })
                targets.sort((a, b) => b.score - a.score)
                if (targets.length > 0 && (targets[0].score > 15 || Math.random() < settings.aiAggression)) { sendTroops(nodeA, targets[0].node, 0.5) }
            }
        })
    }

    const update = (dt) => {
        gameTime += dt
        nodesRef.current.forEach(node => node.update(dt, difficulty))
        troopsRef.current.forEach(troop => troop.update(createExplosion))
        troopsRef.current = troopsRef.current.filter(troop => !troop.dead)
        /* troopsize */
        /* using for loop because we have to return */
        for (let i = 0; i < troopsRef.current.length; i++) {
            const troopA = troopsRef.current[i]
            if (!troopA.dead) {
                for (let j = i + 1; j < troopsRef.current.length; j++) {
                    const troopB = troopsRef.current[j]
                    if (!troopB.dead && troopA.owner !== troopB.owner) {
                        if ((troopA.x - troopB.x) ** 2 + (troopA.y - troopB.y) ** 2 < (troopSize * 2) ** 2) {
                            troopA.dead = true
                            troopB.dead = true
                            createExplosion(troopA.x + troopB.x, troopA.y + troopB.y, '#FFF', 2)
                            return
                        }
                    }
                }
            }
        }
        particles.forEach(particle => particle.update())
        particles = particles.filter(particle => particle.life > 0)
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
        
        connections.forEach(connection => {
            ctx.moveTo(connection.nodeA.x, connection.nodeA.y)
            ctx.lineTo(connection.nodeB.x, connection.nodeB.y)
        })
        ctx.stroke()

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
            })
            ctx.lineTo(dragCurrentRef.current.x, dragCurrentRef.current.y)
            ctx.stroke()
            ctx.setLineDash([])
        }
        troopsRef.current.forEach(troop => troop.draw(ctx))
        particles.forEach(particle => particle.draw(ctx))
    }

    const generateMap = () => {
        const newNodes = []
        let attempts = 0;
        while (newNodes.length < nodeCount && attempts < 100) {
            attempts++;
            const margin = 60
            const x = margin + Math.random() * (canvas.width - margin * 2);
            const y = margin + Math.random() * (canvas.height - margin * 2);
            let valid = true
            for (let n of newNodes) {
                if (((n.x - x) ** 2 + (n.y - y) ** 2) < minimumDistance ** 2) {
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
        connections = []
        newNodes.forEach((nodeA, i) => {
            newNodes.slice(i + 1).forEach(nodeB => {
                if (((nodeA.x - nodeB.x)**2 + (nodeA.y - nodeB.y)**2) < 40000) connections.push({ nodeA, nodeB })
            })
        })
    }

    const animate = () => {
        animationId = requestAnimationFrame(animate)
        if (gameState !== 'playing') {
            previousFrameTime = performance.now()
            return
        }
        currentFrameTime = performance.now()
        let dt = (currentFrameTime - previousFrameTime) / 1000
        if (dt > 0.1) dt = 0.1
        update(dt)
        draw()
        previousFrameTime = currentFrameTime
    }

    const main = () => {
        generateMap()
        previousFrameTime = performance.now()
        animate()
    }
    main()

    return () => cancelAnimationFrame(animationId)
}

export { StartGame }