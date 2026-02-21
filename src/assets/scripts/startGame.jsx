import { Node, Troop, Particle, nodeCount, neutralId, playerId, minimumDistance } from "../../components/configs.js";


let previousFrameTime = 0
let currentFrameTime = 0
let particles = 0
let gameTime = 0

function StartGame({ canvas, difficulty, ctx, gameState, isDraggingRef, nodesRef, sendTroopsRef, troopsRef, dragSelectedRef }) {
    /* isDraggingRef, dragselectedRef is not going to change, so we dont need to do .current here */
    const isDragging = isDraggingRef.current

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

    const update = (dt) => {
        nodesRef.current.forEach((node) => {
            node.update(dt, difficulty)
            node.draw(ctx, dragSelectedRef.current)
        })
    }

    const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.lineWidth = 1
        ctx.strokeStyle = '#374151'
        ctx.beginPath()
        nodesRef.current.forEach((nodeA, i) => {
            nodesRef.current.slice(i+1).forEach((nodeB) => {
                const d = Math.hypot(nodeA.x-nodeB.x, nodeA.y-nodeB.y)
                if (d < 200) {
                    ctx.moveTo(nodeA.x, nodeA.y)
                    ctx.lineTo(nodeB.x, nodeB.y)
                }
                ctx.stroke()
            })
        })
        nodesRef.current.forEach(node => node.draw(ctx, dragSelectedRef.current))
        if (gameTime < 3 && gameState==='playing'){
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