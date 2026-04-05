import { useEffect, useRef } from "react";
import { Node, Troop, Particle, nodeCount, neutralId, playerId, minimumDistance, troopSize, difficultyConfig, aiStartDelay, enemyCooldown, monopolyMode, equalityMode, monopolyLuckyNodePopulation, spyMode, spectatorMode } from "../../components/configs";

import { useGameContext } from "../GameContext";

export function StartGame() {
    const { bgCanvasRef, canvasRef, playCount, nodesRef, troopsRef, sendTroops, gameState, setGameState, setIsWon, difficulty, handleDoubleTapRef, isDraggingRef, dragSelectedRef, dragCurrentRef, gameTimeRef, troopPoolRef, globalPopulationRef, doubleTapPercent, setSpyOwnerId, setWinnerId } = useGameContext();
    const doubleTapPercentRef = useRef(doubleTapPercent);
    doubleTapPercentRef.current = doubleTapPercent;
    const gameStateRef = useRef(gameState);

    useEffect(() => {
        gameStateRef.current = gameState;
    }, [gameState]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const bgCanvas = bgCanvasRef.current;
        if (!canvas || !bgCanvas) return;
        const ctx = canvas.getContext('2d');
        const bgCtx = bgCanvas.getContext('2d', { alpha: true });
        if (!ctx || !bgCtx) return;

        let previousFrameTime = 0;
        let currentFrameTime = 0;
        let particles: Particle[] = [];
        let particlePool: Particle[] = [];
        let gameTime = 0;
        gameTimeRef.current = 0;
        let aiTimer = 0;
        let frameCount = 0;
        let animationId: number;
        let connections: { nodeA: Node, nodeB: Node }[] = [];

        let nodes = nodesRef.current;
        let troops = troopsRef.current;

        function createExplosion(x: number, y: number, color: string, count: number) {
            for (let i = 0; i < count; i++) {
                let p = particlePool.pop();
                if (!p) p = new Particle();
                p.init(x, y, color);
                particles.push(p);
            }
        }

        function drawBackground() {
            if (!bgCtx || !bgCanvas) return;
            bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
            bgCtx.lineWidth = 1;
            bgCtx.strokeStyle = '#374151';
            bgCtx.beginPath();

            connections.forEach(connection => {
                bgCtx.moveTo(connection.nodeA.x, connection.nodeA.y);
                bgCtx.lineTo(connection.nodeB.x, connection.nodeB.y);
            });
            bgCtx.stroke();
        }

        function draw() {
            if (!ctx || !canvas) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            nodes.forEach((node: Node) => {
                node.drawBackground(ctx);
                node.drawForeground(ctx, dragSelectedRef.current);
            });

            if (gameTime < 3 && gameStateRef.current === 'playing') {
                const playerNode = nodes.find((node: Node) => node.owner === playerId);
                if (playerNode) {
                    ctx.save();
                    ctx.translate(playerNode.x, playerNode.y - 50 - Math.sin(gameTime * 5) * 10);
                    ctx.fillStyle = '#FCD34D';
                    ctx.beginPath();
                    ctx.moveTo(-10, 0);
                    ctx.lineTo(10, 0);
                    ctx.lineTo(0, 20);
                    ctx.fill();
                    ctx.font = "bold 16px sans-serif";
                    ctx.fillText("YOU", 0, -10);
                    ctx.restore();
                }
            }

            if (isDraggingRef.current && dragSelectedRef.current.length > 0) {
                ctx.beginPath();
                ctx.lineWidth = 4;
                ctx.strokeStyle = '#FCD34D';
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.setLineDash([10, 10]);
                ctx.moveTo(dragSelectedRef.current[0].x, dragSelectedRef.current[0].y);
                dragSelectedRef.current.forEach((selectedNode: Node) => {
                    ctx.lineTo(selectedNode.x, selectedNode.y);
                });
                ctx.lineTo(dragCurrentRef.current.x, dragCurrentRef.current.y);
                ctx.stroke();
                ctx.setLineDash([]);
            }
            const troopsByOwner: { [key: number]: Troop[] } = {};
            troops.forEach(troop => {
                if (!troopsByOwner[troop.owner]) troopsByOwner[troop.owner] = [];
                troopsByOwner[troop.owner].push(troop);
            });

            Object.keys(troopsByOwner).forEach(ownerIdStr => {
                const ownerId = parseInt(ownerIdStr);
                const ownerTroops = troopsByOwner[ownerId];
                if (ownerTroops.length === 0) return;

                ctx.beginPath();
                ctx.fillStyle = ownerTroops[0].color;
                ownerTroops.forEach(troop => {
                    ctx.moveTo(troop.x + troopSize, troop.y);
                    ctx.arc(troop.x, troop.y, troopSize, 0, Math.PI * 2);
                });
                ctx.fill();

                if (ownerId === playerId) {
                    ctx.lineWidth = 1.5;
                    ctx.strokeStyle = '#ffffff';
                    ctx.stroke();
                }
                ctx.closePath();
            });

            particles.forEach((particle: Particle) => particle.draw(ctx));
        }

        const aiWorker = new Worker(new URL('./ai.worker.ts', import.meta.url), { type: 'module' });

        aiWorker.onmessage = (e) => {
            e.data.forEach((action: { fromId: number; toId: number }) => {
                const fromNode = nodesRef.current.find(n => n.id === action.fromId);
                const toNode = nodesRef.current.find(n => n.id === action.toId);
                if (fromNode && toNode) sendTroops(fromNode, toNode, 0.5);
            });
        };

        function update(dt: number) {
            frameCount++;
            gameTime += dt;
            gameTimeRef.current = gameTime;
            nodes.forEach((node: Node) => node.update(dt, difficulty, globalPopulationRef));
            troops.forEach((troop: Troop) => troop.update(dt, createExplosion, globalPopulationRef));

            const aliveTroops: Troop[] = [];
            troops.forEach(t => {
                if (t.dead) {
                    troopPoolRef.current?.push(t);
                } else {
                    aliveTroops.push(t);
                }
            });
            troops.splice(0, troops.length, ...aliveTroops);

            const gridCellSize = 50;
            const grid: { [key: string]: Troop[] } = {};
            troops.forEach(troop => {
                if (troop.dead) return;
                const gx = Math.floor(troop.x / gridCellSize);
                const gy = Math.floor(troop.y / gridCellSize);
                const key = `${gx},${gy}`;
                if (!grid[key]) grid[key] = [];
                grid[key].push(troop);
            });

            for (let i = 0; i < troops.length; i++) {
                const troopA = troops[i];
                if (troopA.dead || (i + frameCount) % 2 !== 0) continue;

                const gx = Math.floor(troopA.x / gridCellSize);
                const gy = Math.floor(troopA.y / gridCellSize);
                let hit = false;

                for (let ox = -1; ox <= 1; ox++) {
                    for (let oy = -1; oy <= 1; oy++) {
                        const key = `${gx + ox},${gy + oy}`;
                        const cellTroops = grid[key];
                        if (!cellTroops) continue;

                        for (let j = 0; j < cellTroops.length; j++) {
                            const troopB = cellTroops[j];
                            if (!troopB.dead && troopA !== troopB && (troopA.ownerMask & troopB.ownerMask) === 0) {
                                if ((troopA.x - troopB.x) ** 2 + (troopA.y - troopB.y) ** 2 < (troopSize * 2) ** 2) {
                                    troopA.dead = true;
                                    troopB.dead = true;
                                    globalPopulationRef.current[troopA.owner] = Math.max(0, (globalPopulationRef.current[troopA.owner] || 0) - 1);
                                    globalPopulationRef.current[troopB.owner] = Math.max(0, (globalPopulationRef.current[troopB.owner] || 0) - 1);
                                    createExplosion((troopA.x + troopB.x) / 2, (troopA.y + troopB.y) / 2, '#FFF', 2);
                                    hit = true;
                                    break;
                                }
                            }
                        }
                        if (hit) break;
                    }
                    if (hit) break;
                }
            }

            const aliveParticles: Particle[] = [];
            particles.forEach(p => {
                p.update();
                if (p.life > 0) aliveParticles.push(p);
                else particlePool.push(p);
            });
            particles = aliveParticles;
            aiTimer += dt * 1000;
            if (gameTime > aiStartDelay && aiTimer > difficultyConfig[difficulty].aiInterval) {
                aiWorker.postMessage({
                    nodes: nodes.map(n => ({ ...n })),
                    difficulty,
                    difficultyConfig,
                    playerId,
                    neutralId,
                    gameTime,
                    enemyCooldown,
                    equalityMode

                });
                aiTimer = 0;
            }
            checkWinCondition();
        }

        function checkWinCondition() {
            if (gameStateRef.current !== 'playing') return;
            const owners = new Set(nodes.map((node: Node) => node.owner));
            let won: boolean | null = null;
            
            if (spectatorMode) {
                const activeOwners = new Set<number>();
                nodes.forEach(n => { if (n.owner !== neutralId) activeOwners.add(n.owner); });
                troops.forEach(t => { if (t.owner !== neutralId) activeOwners.add(t.owner); });
                
                if (activeOwners.size === 1) {
                    won = true;
                    setWinnerId(Array.from(activeOwners)[0]);
                } else if (activeOwners.size === 0) {
                    won = false;
                    setWinnerId(null);
                }
            } else {
                if (!owners.has(playerId) && !troops.some((troop: Troop) => troop.owner === playerId)) {
                    won = false;
                } else if (owners.size === 1 && owners.has(playerId)) {
                    won = true;
                } else if (owners.size === 2 && owners.has(playerId) && owners.has(neutralId) && !troops.some((troop: Troop) => troop.owner !== playerId)) {
                    won = true;
                }
            }
            
            if (won !== null) {
                setIsWon(won);
                setGameState('gameover');
            }
        }

        function randomTroopSize() {
            return Math.ceil(Math.random() * 20) + 20;
        }

        function generateMap() {
            const newNodes: Node[] = [];
            let attempts = 0;
            while (newNodes.length < nodeCount && attempts < 100) {
                attempts++;
                const margin = 60;
                if (!canvas) return;
                const x = margin + Math.random() * (canvas.width - margin * 2);
                const y = margin + Math.random() * (canvas.height - margin * 2);
                let valid = true;
                for (let n of newNodes) {
                    if (((n.x - x) ** 2 + (n.y - y) ** 2) < minimumDistance ** 2) {
                        valid = false;
                        break;
                    }
                }
                if (valid) {
                    let owner = neutralId;
                    let pop = 10 + Math.floor(Math.random() * 25);
                    if (!spectatorMode && newNodes.length === 0) {
                        owner = playerId;
                        pop = 60;
                    }
                    else if (newNodes.length <= 10) {
                        owner = newNodes.length;
                        if (spectatorMode && newNodes.length === 0) {
                            owner = 10;
                        }
                        pop = randomTroopSize();
                    }
                    newNodes.push(new Node(newNodes.length, Math.floor(x), Math.floor(y), owner, pop));
                }
            }

            if (monopolyMode) {
                const enemyNodes = newNodes.filter(n => n.owner !== playerId && n.owner !== neutralId);
                if (enemyNodes.length > 0) {
                    const luckyEnemy = enemyNodes[Math.floor(Math.random() * enemyNodes.length)];
                    luckyEnemy.population = monopolyLuckyNodePopulation;

                    if (spyMode) {
                        const enemyOwners = [...new Set(enemyNodes.map(n => n.owner))].filter(id => id !== luckyEnemy.owner);
                        if (enemyOwners.length > 0) {
                            setSpyOwnerId(enemyOwners[Math.floor(Math.random() * enemyOwners.length)]);
                        } else {
                            setSpyOwnerId(-1);
                        }
                    }
                }
            } else if (spyMode) {
                const enemyNodes = newNodes.filter(n => n.owner !== playerId && n.owner !== neutralId);
                const enemyOwners = [...new Set(enemyNodes.map(n => n.owner))];
                if (enemyOwners.length > 0) {
                    setSpyOwnerId(enemyOwners[Math.floor(Math.random() * enemyOwners.length)]);
                } else {
                    setSpyOwnerId(-1);
                }
            } else {
                setSpyOwnerId(-1);
            }

            nodes.splice(0, nodes.length, ...newNodes);

            globalPopulationRef.current = {};
            newNodes.forEach((node) => {
                globalPopulationRef.current[node.owner] = (globalPopulationRef.current[node.owner] || 0) + node.population;
            });

            connections = [];
            newNodes.forEach((nodeA, i) => {
                newNodes.slice(i + 1).forEach(nodeB => {
                    if (((nodeA.x - nodeB.x) ** 2 + (nodeA.y - nodeB.y) ** 2) < 40000) connections.push({ nodeA, nodeB });
                });
            });
            troops.splice(0, troops.length);
            drawBackground();
        }

        const handleResize = () => {
            if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                bgCanvas.width = window.innerWidth;
                bgCanvas.height = window.innerHeight;
                drawBackground();
                draw();
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        handleDoubleTapRef.current = (x: number, y: number) => {
            const targetNode = nodes.find((node: Node) => ((node.x - x) ** 2 + (node.y - y) ** 2) < (node.radius * 1.5) ** 2);
            if (targetNode) {
                nodes.forEach(node => {
                    if (node.owner === playerId && node !== targetNode) {
                        sendTroops(node, targetNode, doubleTapPercentRef.current);
                    }
                });
                createExplosion(targetNode.x, targetNode.y, '#FF0000', 10);
            }
        };

        const animate = () => {
            animationId = requestAnimationFrame(animate);
            if (gameStateRef.current !== 'playing') {
                previousFrameTime = performance.now();
                return;
            }
            currentFrameTime = performance.now();
            let dt = (currentFrameTime - previousFrameTime) / 1000;
            if (dt > 0.1) dt = 0.1;
            update(dt);
            draw();
            previousFrameTime = currentFrameTime;
        };

        generateMap();
        previousFrameTime = performance.now();
        animate();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
            aiWorker.terminate();
        };
    }, [playCount, difficulty]);

    return null;
}