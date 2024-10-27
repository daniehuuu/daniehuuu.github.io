const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');
const contextMenu = document.getElementById('contextMenu');
const contextMenuEdge = document.getElementById('contextMenuEdge');
const changeLabelOption = document.getElementById('changeLabel');
const connectNodeOption = document.getElementById('connectNode');
const deleteNodeOption = document.getElementById('deleteNode');
const clearGraphButton = document.getElementById('clearGraphButton');
const setFuenteOption = document.getElementById('setFuente');
const setSumideroOption = document.getElementById('setSumidero');
const logsDiv = document.getElementById('logs');
const iniciarAlgoritmoButton = document.getElementById('iniciarAlgoritmo');
const grafosButton = document.getElementById("grafosButton");
const closeModal = document.getElementById("closeModal");
const closeGrafosModal = document.getElementById("closeGrafosModal");
const algorithmModal = document.getElementById("algorithmModal");
const grafosModal = document.getElementById("grafosModal");
const editEdgeLabelOption = document.getElementById('editEdgeLabel');
const deleteEdgeOption = document.getElementById('deleteEdge');

// Botones del modal de grafos
const grafoDemoButton = document.getElementById('demoButton');
const simpleDemoButton = document.getElementById('simpleDemoButton');
const yetAnotherDemoButton = document.getElementById('yetAnotherDemoButton');

// Botones del modal de algoritmo
const directResponseButton = document.getElementById("directResponseButton");
const visualizationButton = document.getElementById("visualizationButton");
const visualizationTrayectoriasButton = document.getElementById("visualizationTrayectoriasButton");

let id_1_1 = 0;
let nodes = [];
let edges = [];
let selectedNode = null;
let selectedEdge = null;
let isDragging = false;
let nodeToConnect = null;
let fuenteNode = null;
let sumideroNode = null;
let algorithmStarted = false;
let trayectorias = [];
let noDelay = false;

function ocultar_botones(){
    // Ocultar botones una vez que el algoritmo empieza
    iniciarAlgoritmoButton.style.display = 'none';
    clearGraphButton.style.display = 'none';
    grafosButton.style.display = 'none';

    algorithmStarted = true;
}
// Eventos para abrir y cerrar modales
iniciarAlgoritmoButton.addEventListener("click", () => {
    // Verificación de nodos, fuente y sumidero
    if (nodes.length === 0) {
        alert('No hay nodos en el grafo.');
        return;
    }
    if (!fuenteNode) {
        alert('No se ha seleccionado un nodo fuente.');
        return;
    }
    if (!sumideroNode) {
        alert('No se ha seleccionado un nodo sumidero.');
        return;
    }
    algorithmModal.style.display = "block";
});

grafosButton.addEventListener("click", () => {
    grafosModal.style.display = "block";
});

closeModal.addEventListener("click", () => {
    algorithmModal.style.display = "none";
});

closeGrafosModal.addEventListener("click", () => {
    grafosModal.style.display = "none";
});

window.onclick = (event) => {
    if (event.target === algorithmModal) {
        algorithmModal.style.display = "none";
    } else if (event.target === grafosModal) {
        grafosModal.style.display = "none";
    }
};

// Manejo de botones en el modal de algoritmo
directResponseButton.addEventListener("click", () => {
    ocultar_botones();
    algorithmModal.style.display = "none";
    flujo_respuesta_directa();
});

visualizationButton.addEventListener("click", () => {
    ocultar_botones();
    algorithmModal.style.display = "none";
    flujo_visualization();
});

visualizationTrayectoriasButton.addEventListener("click", () => {
    ocultar_botones();
    algorithmModal.style.display = "none";
    flujo_visualization_trayectorias();
});

// Manejo de botones en el modal de grafos
grafoDemoButton.addEventListener("click", () => {
    grafosModal.style.display = "none";
    grafoDemo();
});

simpleDemoButton.addEventListener("click", () => {
    grafosModal.style.display = "none";
    simpleDemo();
});

yetAnotherDemoButton.addEventListener("click", () => {
    grafosModal.style.display = "none";
    yetAnotherDemo();
});

// Eventos del canvas y del contexto del grafo
canvas.addEventListener('dblclick', addNode);
canvas.addEventListener('click', selectNode);
canvas.addEventListener('mousedown', startDrag);
canvas.addEventListener('mousemove', dragNode);
canvas.addEventListener('mouseup', endDrag);
canvas.addEventListener('contextmenu', showContextMenu);

changeLabelOption.addEventListener('click', changeLabel);
connectNodeOption.addEventListener('click', connectNodes);
deleteNodeOption.addEventListener('click', deleteNode);
setFuenteOption.addEventListener('click', toggleFuenteNode);
setSumideroOption.addEventListener('click', toggleSumideroNode);

editEdgeLabelOption.addEventListener('click', editEdgeLabel);
deleteEdgeOption.addEventListener('click', deleteEdge);

clearGraphButton.addEventListener('click', clearGraph);


function addNode(event) {
    const x = event.offsetX;
    const y = event.offsetY;
    nodes.push({
        id: id_1_1,
        x,
        y,
        label: `N${id_1_1}`,
        isFuente: false,
        isSumidero: false,
        predecessor: null,
        value: null
    });
    id_1_1++;
    draw();
}

function selectNode(event) {
    const x = event.offsetX;
    const y = event.offsetY;
    selectedNode = getNodeAt(x, y);
}

function startDrag(event) {
    if (event.button !== 0) return;
    const x = event.offsetX;
    const y = event.offsetY;
    selectedNode = getNodeAt(x, y);
    if (selectedNode) {
        isDragging = true;
    }
}

function dragNode(event) {
    if (isDragging && selectedNode) {
        const x = event.offsetX;
        const y = event.offsetY;
        selectedNode.x = x;
        selectedNode.y = y;
        draw();
    }
}

function endDrag() {
    isDragging = false;
    selectedNode = null;
}

function changeLabel() {
    if (selectedNode) {
        const newLabel = prompt('Enter new label:', selectedNode.label);
        if (newLabel !== null) {
            selectedNode.label = newLabel;
            draw();
        }
    }
    contextMenu.style.display = 'none';
}

function isPositiveNumber(value) {
    const number = Number(value);
    return !isNaN(number) && number > 0;
}

function addEdgeBidirectional(v, u, cost) {
    edges.push({ startNode: v, endNode: u, label: cost, starting: v });
    edges.push({ startNode: u, endNode: v, label: cost, starting: v });
}

function connectNodes() {
    //nodeToConnect -> selectedNode
    if (nodeToConnect) {
        if (nodeToConnect === selectedNode) {
            // Cancel the connection
            nodeToConnect = null;
            connectNodeOption.textContent = 'Connect Node';
            contextMenu.style.display = 'none'; // Hide the context menu
            draw();
            return;
        }
        if (edges.some(edge => edge.startNode === nodeToConnect && edge.endNode === selectedNode)) {
            alert('An edge already exists between these nodes.');
            nodeToConnect = null;
            connectNodeOption.textContent = 'Connect Node';
            contextMenu.style.display = 'none'; // Hide the context menu
            draw();
            return;
        }
        if (selectedNode.isFuente) {
            alert('La fuente no puede ser un nodo de entrada');
            nodeToConnect = null;
            draw();
            return;
        }
        if (nodeToConnect.isSumidero) {
            alert('El sumidero no puede ser un nodo de salida');
            nodeToConnect = null;
            draw();
            return;
        }
        let edgeLabel;
        let infOp = ["inf", "infty", "infinity", "infinito"];
        do {
            edgeLabel = prompt('Ingresa un número positivo:', '');
            if (edgeLabel === null) {
                nodeToConnect = null;
                connectNodeOption.textContent = 'Connect Node';
                contextMenu.style.display = 'none'; // Hide the context menu
                draw();
                return;
            }
        } while (!isPositiveNumber(edgeLabel) && !infOp.includes(edgeLabel));

        if (infOp.includes(edgeLabel)) {
            edgeLabel = Infinity;
        }
        // Store both directions internally
        addEdgeBidirectional(nodeToConnect, selectedNode, edgeLabel);

        nodeToConnect = null;
        connectNodeOption.textContent = 'Connect Node';
        contextMenu.style.display = 'none'; // Hide the context menu
        draw();
    } else {
        nodeToConnect = selectedNode;
        connectNodeOption.textContent = 'Cancel connection';
        contextMenu.style.display = 'none'; // Hide the context menu
        draw();
    }
}

function deleteNode() {
    if (!selectedNode) return;

    if (selectedNode.isFuente) {
        fuenteNode = null;
    }

    if (selectedNode.isSumidero) {
        sumideroNode = null;
    }

    nodes = nodes.filter(node => node !== selectedNode);
    edges = edges.filter(edge => edge.startNode !== selectedNode && edge.endNode !== selectedNode);

    nodeToConnect = null;

    draw();
    contextMenu.style.display = 'none';
}

function getNodeAt(x, y) {
    return nodes.find(node => Math.hypot(node.x - x, node.y - y) < 20);
}

function getEdgeAt(x, y) {
    return edges.find(edge => {
        const { startNode, endNode } = edge;
        const distanceToLine = Math.abs((endNode.y - startNode.y) * x - (endNode.x - startNode.x) * y + endNode.x * startNode.y - endNode.y * startNode.x) / Math.hypot(endNode.x - startNode.x, endNode.y - startNode.y);
        return distanceToLine < 5;
    });
}

function editEdgeLabel() {
    let newLabel;
    let infOp = ["inf", "infty", "infinity", "infinito"];
    do {
        newLabel = prompt('Enter new edge label (positive integer):', selectedEdge.label);
        if (newLabel === null) {
            // User cancelled the prompt, exit the function
            contextMenuEdge.style.display = 'none';
            return;
        }
    } while (!isPositiveNumber(newLabel) && !infOp.includes(newLabel));

    if (infOp.includes(newLabel)) {
        newLabel = Infinity;
    }

    selectedEdge.label = newLabel;

    draw();
    contextMenuEdge.style.display = 'none';

}


function deleteEdge() {
    edges = edges.filter(edge => edge !== selectedEdge);
    draw();
    contextMenuEdge.style.display = 'none';
}

canvas.addEventListener('click', () => {
    if (contextMenu) {
        contextMenu.style.display = 'none';
    }
    if (contextMenuEdge) {
        contextMenuEdge.style.display = 'none';
    }
});

canvas.addEventListener('contextmenu', function (event) {
    const x = event.offsetX;
    const y = event.offsetY;

    if (getEdgeAt(x, y)) {
        showContextMenu(event);
    } else if (getNodeAt(x, y)) {
        showContextMenu(event);
    } else {
        if (contextMenu) {
            contextMenu.style.display = 'none';
        }
        if (contextMenuEdge) {
            contextMenuEdge.style.display = 'none';
        }
    }
});

canvas.addEventListener('contextmenu', function (event) {
    event.preventDefault();
    if (algorithmStarted) {
        return; // Do not open context menu if algorithm has started
    }
    // Existing context menu logic
    const mouseX = event.clientX - canvas.getBoundingClientRect().left;
    const mouseY = event.clientY - canvas.getBoundingClientRect().top;
    selectedNode = getNodeAt(mouseX, mouseY);
    if (selectedNode) {
        contextMenu.style.left = `${event.clientX}px`;
        contextMenu.style.top = `${event.clientY}px`;
        contextMenu.style.display = 'block';
    }
});

document.addEventListener('click', function (event) {
    if (!contextMenu.contains(event.target) && !contextMenuEdge.contains(event.target)) {
        contextMenu.style.display = 'none';
        contextMenuEdge.style.display = 'none';
    }
});

// Modify the existing canvas click event listener to close context menus
canvas.addEventListener('click', (event) => {
    if (!contextMenu.contains(event.target) && !contextMenuEdge.contains(event.target)) {
        contextMenu.style.display = 'none';
        contextMenuEdge.style.display = 'none';
    }
});


function showContextMenu(event) {
    if (algorithmStarted) {
        return; // Disable context menu when algorithm has started
    }
    event.preventDefault();
    const x = event.offsetX;
    const y = event.offsetY;
    selectedNode = getNodeAt(x, y);
    selectedEdge = getEdgeAt(x, y);
    if (selectedNode) {
        if (selectedNode.isFuente) {
            setFuenteOption.textContent = 'Unset Fuente';
        } else {
            setFuenteOption.textContent = 'Set as Fuente';
        }
        if (selectedNode.isSumidero) {
            setSumideroOption.textContent = 'Unset Sumidero';
        } else {
            setSumideroOption.textContent = 'Set as Sumidero';
        }
        if (nodeToConnect === selectedNode) {
            connectNodeOption.textContent = 'Cancel connection';
        } else {
            connectNodeOption.textContent = 'Connect Node';
        }
        contextMenu.style.display = 'block';
        contextMenu.style.left = `${event.pageX}px`;
        contextMenu.style.top = `${event.pageY}px`;
        contextMenuEdge.style.display = 'none';
    } else if (selectedEdge) {
        contextMenuEdge.style.display = 'block';
        contextMenuEdge.style.left = `${event.pageX}px`;
        contextMenuEdge.style.top = `${event.pageY}px`;
        contextMenu.style.display = 'none';
    }
}

function nodeConnectsAnother(node) {
    return edges.some(edge => edge.startNode === node && edge.starting === node);
}
function someNodeConnectsNode(node) {
    return edges.some(edge => edge.endNode === node && edge.starting !== node);
}
function toggleFuenteNode() {
    if (selectedNode) {
        if (selectedNode.isFuente) {
            selectedNode.isFuente = false;
            fuenteNode = null;
        } else {
            if (fuenteNode) {
                fuenteNode.isFuente = false;
            }
            if (selectedNode.isSumidero) {
                selectedNode.isSumidero = false;
                sumideroNode = null;
            }
            if (someNodeConnectsNode(selectedNode)) {
                alert('La fuente no puede tener conexiones de entrada');
                return;
            }
            selectedNode.isFuente = true;
            fuenteNode = selectedNode;
        }
        draw();
        contextMenu.style.display = 'none';
    }
}

function toggleSumideroNode() {
    if (selectedNode) {
        if (selectedNode.isSumidero) {
            selectedNode.isSumidero = false;
            sumideroNode = null;
        } else {
            if (sumideroNode) {
                sumideroNode.isSumidero = false;
            }
            if (selectedNode.isFuente) {
                selectedNode.isFuente = false;
                fuenteNode = null;
            }
            if (nodeConnectsAnother(selectedNode)) {
                alert('El sumidero no puede tener conexiones de salida');
                return;
            }
            selectedNode.isSumidero = true;
            sumideroNode = selectedNode;
        }
        draw();
        contextMenu.style.display = 'none';
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    edges.forEach(drawEdge);
    nodes.forEach(drawNode);
}

function drawNode(node) {
    ctx.beginPath();
    ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
    if (node === nodeToConnect) {
        ctx.fillStyle = 'red';
    } else if (node.isFuente) {
        ctx.fillStyle = 'orange';
    } else if (node.isSumidero) {
        ctx.fillStyle = 'purple';
    } else {
        ctx.fillStyle = 'blue';
    }
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.stroke();
    ctx.fillStyle = 'white';
    ctx.fillText(node.label, node.x - 10, node.y + 5);

    // Display node value if available
    if (node.value !== null && node.predecessor !== undefined) {
        ctx.save();
        ctx.font = '16px Arial';
        if (node.value === Infinity) {
            ctx.fillText(`[${node.predecessor}; ∞]`, node.x - 15, node.y - 22);
        } else {
            ctx.fillText(`[${node.predecessor}; ${node.value}]`, node.x - 15, node.y - 22);
        }
        ctx.restore();
    }
}

function drawEdge(edge) {
    const { startNode, endNode, label, flujo, starting } = edge;
    const angle = Math.atan2(endNode.y - startNode.y, endNode.x - startNode.x);
    const startX = startNode.x + 20 * Math.cos(angle);
    const startY = startNode.y + 20 * Math.sin(angle);
    const endX = endNode.x - 20 * Math.cos(angle);
    const endY = endNode.y - 20 * Math.sin(angle);

    // Draw the edge line only if it matches the original direction
    if (starting === startNode) {
        ctx.strokeStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Draw the arrowhead
        const arrowLength = 10;
        const arrowWidth = 7;

        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - arrowLength * Math.cos(angle - Math.PI / 6),
            endY - arrowLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            endX - arrowLength * Math.cos(angle + Math.PI / 6),
            endY - arrowLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = 'white';
        ctx.fill();

        // Draw the label with capacity/flujo
        if (label) {
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;

            // Save the current context state
            ctx.save();
            // Set font size and outline for the label

            ctx.font = '16px Arial'; // Increase font size
            ctx.lineWidth = 3; // Set outline width
            ctx.strokeStyle = 'black'; // Set outline color
            ctx.fillStyle = 'white'; // Set fill color

            if (typeof flujo !== 'undefined') {
                if (label === Infinity) {
                    ctx.strokeText(`∞/${flujo}`, midX, midY);
                    ctx.fillText(`∞/${flujo}`, midX, midY);
                } else {
                    ctx.strokeText(`${label}/${flujo}`, midX, midY);
                    ctx.fillText(`${label}/${flujo}`, midX, midY);
                }
            } else {
                if (label === Infinity) {
                    ctx.strokeText(`∞`, midX, midY);
                    ctx.fillText(`∞`, midX, midY);
                } else {
                    ctx.strokeText(label, midX, midY);
                    ctx.fillText(label, midX, midY);
                }
            }
            // Restore the context state to avoid affecting other drawings
            ctx.restore();
        }
    }
}

// Examples of graphs

function grafoDemo() {
    var halfHeight = canvas.height / 2;
    nodes.push({ id: "a", x: 100, y: halfHeight, label: 'a', isFuente: true, isSumidero: false, predecessor: null, value: null });
    nodes.push({ id: "A", x: 300, y: halfHeight - 200, label: 'A', isFuente: false, isSumidero: false, predecessor: null, value: null });
    nodes.push({ id: "B", x: 300, y: halfHeight, label: 'B', isFuente: false, isSumidero: false, predecessor: null, value: null });
    nodes.push({ id: "C", x: 300, y: 200 + halfHeight, label: 'C', isFuente: false, isSumidero: false, predecessor: null, value: null });
    nodes.push({ id: "Z1", x: 450, y: halfHeight - 200, label: 'Z1', isFuente: false, isSumidero: false, predecessor: null, value: null });
    nodes.push({ id: "Z2", x: 550, y: halfHeight, label: 'Z2', isFuente: false, isSumidero: false, predecessor: null, value: null });
    nodes.push({ id: "Z3", x: 450, y: 270 + halfHeight, label: 'Z3', isFuente: false, isSumidero: false, predecessor: null, value: null });
    nodes.push({ id: "Z", x: 700, y: halfHeight, label: 'Z', isFuente: false, isSumidero: true, predecessor: null, value: null });

    addEdgeBidirectional(nodes[0], nodes[1], 1);
    addEdgeBidirectional(nodes[0], nodes[2], 1);
    addEdgeBidirectional(nodes[0], nodes[3], 1);
    addEdgeBidirectional(nodes[1], nodes[4], 1);
    addEdgeBidirectional(nodes[1], nodes[6], 1);
    addEdgeBidirectional(nodes[2], nodes[4], 1);
    addEdgeBidirectional(nodes[2], nodes[5], 1);
    addEdgeBidirectional(nodes[3], nodes[4], 1);
    addEdgeBidirectional(nodes[4], nodes[7], 1);
    addEdgeBidirectional(nodes[5], nodes[7], 1);
    addEdgeBidirectional(nodes[6], nodes[7], 1);

    fuenteNode = nodes[0];
    sumideroNode = nodes[7];

    draw();
}

function simpleDemo() {
    const halfHeight = canvas.height / 2;
    nodes.push({ id: "s", x: 100, y: halfHeight, label: 's', isFuente: true, isSumidero: false, predecessor: null, value: null });
    nodes.push({ id: "A", x: 300, y: halfHeight - 150, label: 'A', isFuente: false, isSumidero: false, predecessor: null, value: null });
    nodes.push({ id: "B", x: 400, y: halfHeight, label: 'B', isFuente: false, isSumidero: false, predecessor: null, value: null });
    nodes.push({ id: "C", x: 300, y: halfHeight + 110, label: 'C', isFuente: false, isSumidero: false, predecessor: null, value: null });
    nodes.push({ id: "D", x: 500, y: halfHeight + 100, label: 'D', isFuente: false, isSumidero: false, predecessor: null, value: null });
    nodes.push({ id: "t", x: canvas.width - 100, y: halfHeight, label: 't', isFuente: false, isSumidero: true, predecessor: null, value: null });

    //s -> A (3.5), s -> B (4), s -> c (5), A -> B (2.3), A -> t (1), C -> B (2), D -> B (infinity), D -> t (3)
    addEdgeBidirectional(nodes[0], nodes[1], 3.5);
    addEdgeBidirectional(nodes[0], nodes[2], 4);
    addEdgeBidirectional(nodes[0], nodes[3], 5);
    addEdgeBidirectional(nodes[1], nodes[2], 2.3);
    addEdgeBidirectional(nodes[1], nodes[5], 1);
    addEdgeBidirectional(nodes[3], nodes[2], 2);
    addEdgeBidirectional(nodes[4], nodes[2], Infinity);
    addEdgeBidirectional(nodes[4], nodes[5], 3);

    fuenteNode = nodes[0];
    sumideroNode = nodes[5];
    draw();
}

function yetAnotherDemo() {
    var halfHeight = canvas.height / 2;
    nodes.push({ id: "s", x: 100, y: halfHeight, label: 's', isFuente: true, isSumidero: false, predecessor: null, value: null });
    nodes.push({ id: "A", x: 300, y: halfHeight - 200, label: 'A', isFuente: false, isSumidero: false, predecessor: null, value: null });
    nodes.push({ id: "B", x: 300, y: 200 + halfHeight, label: 'B', isFuente: false, isSumidero: false, predecessor: null, value: null });
    nodes.push({ id: "Y", x: 450, y: halfHeight - 200, label: 'Y', isFuente: false, isSumidero: false, predecessor: null, value: null });
    nodes.push({ id: "X", x: 550, y: halfHeight, label: 'X', isFuente: false, isSumidero: false, predecessor: null, value: null });
    nodes.push({ id: "Z", x: 450, y: 200 + halfHeight, label: 'Z', isFuente: false, isSumidero: false, predecessor: null, value: null });
    nodes.push({ id: "t", x: 700, y: halfHeight, label: 't', isFuente: false, isSumidero: true, predecessor: null, value: null });

    // s -> A (2), s -> B (12), A -> B (3), A -> Y (8), B -> Z (10), Z -> A (6), Y -> X (7), X -> Z (1), Y -> t (2), X -> t(6), Z -> t (5)
    addEdgeBidirectional(nodes[0], nodes[1], 2);
    addEdgeBidirectional(nodes[0], nodes[2], 12);
    addEdgeBidirectional(nodes[1], nodes[2], 3);
    addEdgeBidirectional(nodes[1], nodes[3], 8);
    addEdgeBidirectional(nodes[2], nodes[5], 11);
    addEdgeBidirectional(nodes[5], nodes[1], 6);
    addEdgeBidirectional(nodes[3], nodes[4], 7);
    addEdgeBidirectional(nodes[4], nodes[5], 1);
    addEdgeBidirectional(nodes[3], nodes[6], 2);
    addEdgeBidirectional(nodes[4], nodes[6], 7);
    addEdgeBidirectional(nodes[5], nodes[6], 5);

    fuenteNode = nodes[0];
    sumideroNode = nodes[6];

    draw();
}

function clearGraph() {
    id_1_1 = 0;
    nodes = [];
    edges = [];
    selectedNode = null;
    selectedEdge = null;
    nodeToConnect = null;
    fuenteNode = null;
    sumideroNode = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


function delay(ms) {
    if (noDelay) return;
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* we will allow trivial graphs
function hasPathFromFuenteToSumidero() {
    if (!fuenteNode || !sumideroNode) return false;

    const visited = new Set();
    const stack = [fuenteNode];

    while (stack.length > 0) {
        const currentNode = stack.pop();
        if (currentNode === sumideroNode) return true;

        visited.add(currentNode);

        edges.forEach(edge => {
            if (edge.startNode === currentNode && edge.starting === currentNode && !visited.has(edge.endNode)) {
                stack.push(edge.endNode);
            }
        });
    }

    return false;
}
*/

function subscript(number) {
    const subscriptDigits = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
    return number.toString().split('').map(digit => subscriptDigits[parseInt(digit)]).join('');
}

function infLabel(label) {
    return (label === Infinity) ? "∞" : label;
}

async function flujo_respuesta_directa() {
    noDelay = true;
    await flujo_visualization();
    noDelay = false;
}


async function flujo_visualization() {
    // Inicialización de flujos
    edges.forEach(edge => {
        edge.flujo = 0;
    });
    console.log("Se inicializan los flujos en 0");
    draw();
    await delay(2500);

    let whileCount = 0;
    while (true) {
        whileCount++;
        console.log(`W1${subscript(whileCount)}:\n`);

        // Inicialización de etiquetas

        nodes.forEach(node => {
            node.value = null;
            node.predecessor = null;
        });
        console.log("Se eliminan las etiquetas");
        draw();
        await delay(3000);
        let U = [];

        // Inicialización de la fuente
        console.log("Se etiqueta la fuente");
        fuenteNode.value = Infinity;
        fuenteNode.predecessor = "-";
        U.push(fuenteNode);
        console.log("U: ", `{${U.map(node => node.label).join(", ")}}`);
        draw();
        await delay(3000);

        let nestedWhileCount = 0;
        while (sumideroNode.value === null) {
            nestedWhileCount++;
            console.clear();
            console.log(`W1${subscript(whileCount)}-W1${subscript(nestedWhileCount)}:\n`);
            if (U.length === 0) {
                console.log("No hay más nodos en U");
                await delay(2000);
                console.clear();
                mostrar_resultado();
                return;
            }

            let u = U.shift();
            let delta = u.value;
            console.log(`Se selecciona el nodo ${u.label}`);
            console.log(`Delta = ${infLabel(delta)}`);
            console.log("U:", `{${U.map(node => node.label).join(", ")}}`);
            await delay(3000);
            console.log(`Se seleccionan conexiones de ${u.label} a otro nodo: `);
            await delay(2000);
            let i = 0
            for (; i < edges.length; i++) {
                const edge = edges[i];

                if (edge.startNode === u && edge.starting === u) {
                    console.log(`W1${subscript(whileCount)}-W1${subscript(nestedWhileCount)}-F1${subscript(i + 1)}:\n`);
                    const v = edge.endNode;
                    const residualCapacity = edge.label - edge.flujo;

                    console.log(`(${u.label}, ${v.label}): `);

                    if (residualCapacity <= 0) {
                        console.log(`La capacidad residual es muy baja: ${residualCapacity}`);
                        await delay(3000);
                        continue;
                    }

                    if (v.value !== null) {
                        console.log(`El nodo ${v.label} ya está etiquetado`);
                        await delay(3000);
                        continue;
                    }

                    v.value = Math.min(u.value, residualCapacity);
                    v.predecessor = u.label + "\u207A"; // Unicode for superscript plus sign

                    U.push(v);
                    draw();
                    console.log(`${v.label} no está conectado y la capacidad residual es ${infLabel(edge.label)} - ${edge.flujo} = ${infLabel(residualCapacity)}`);
                    console.log(`Predecesor = ${u.label}. min(${infLabel(u.value)}, ${infLabel(residualCapacity)}) = ${infLabel(v.value)}`);
                    await delay(3500);
                }
            }

            console.log(`Se seleccionan conexiones de algun nodo a ${u.label}: `);
            await delay(3000);
            i = 0;
            for (; i < edges.length; i++) {
                const edge = edges[i];
                if (edge.endNode === u && edge.starting !== u) {
                    console.log(`W1${subscript(whileCount)}-W1${subscript(nestedWhileCount)}-F2${subscript(i + 1)}:\n`);
                    const v = edge.startNode;
                    console.log(`(${v.label}, ${u.label}): `);

                    if (edge.flujo <= 0) {
                        console.log(`El flujo es muy bajo: ${edge.flujo} > 0 (falso)`);
                        await delay(3000);
                        continue;
                    }

                    if (v.value !== null) {
                        console.log(`El nodo ${v.label} ya está etiquetado`);
                        await delay(3000);
                        continue;
                    }

                    v.value = Math.min(u.value, edge.flujo);
                    v.predecessor = u.label + "\u207B";
                    U.push(v);
                    draw();
                    console.log(`El flujo es mayor que 0 y ${v.label} no está etiquetado`);
                    console.log(`Predecesor de ${v.label} es ${v.predecessor} y su valor = min(${u.value}, ${edge.flujo}) = ${v.value}`);
                    await delay(3500);
                }
            }
            if (sumideroNode.value !== null) {
                console.log("Se ha encontrado una trayectoria de la fuente al sumidero");
                await delay(2000);
                console.clear();
            }
        }
        let v = sumideroNode;
        let path = [v];
        const printReversePath = () => path.map(node => node.label).reverse().join(" -> "); // Lambda function to print the path in reverse

        console.log("Encontrando la trayectoria:\n");
        console.log(`Empezamos en: ${printReversePath()}`);
        let iteration = 1;
        await delay(2000);
        while (v.predecessor.replace(/\u207A|\u207B/g, '') !== "-") {
            v = nodes.find(node => node.label === v.predecessor.replace(/\u207A|\u207B/g, ''));
            path.push(v);
            console.log(`W1${subscript(whileCount)}-W2${subscript(iteration)}: ${printReversePath()}`);
            iteration++;
            await delay(2000);
        }

        console.clear();
        let tray = printReversePath();
        let delta = sumideroNode.value;

        console.log("Trayectoria encontrada:", tray);
        trayectorias.push([tray, delta]);
        await delay(4000);
        i = 0;
        for (; i < path.length - 1; i++) {
            console.log(`W1${subscript(whileCount)}-F2${subscript(i + 1)}:\n`);
            const u = path[i];
            const v = path[i + 1];
            console.log(`(${v.label}, ${u.label}): `);
            const edge = edges.find(edge => edge.startNode === v && edge.endNode === u && edge.starting === v);
            if (edge) {
                edge.flujo += delta;
                const inverseEdge = edges.find(edge => edge.startNode === u && edge.endNode === v && edge.starting === v);
                inverseEdge.flujo += delta;
                console.log(`Se aumenta el flujo en ${delta}`);
            } else {
                const edge = edges.find(edge => edge.startNode === u && edge.endNode === v && edge.starting === u);
                const inverseEdge = edges.find(edge => edge.startNode === v && edge.endNode === u && edge.starting === u);
                edge.flujo -= delta;
                inverseEdge.flujo -= delta;
                console.log(`Se disminuye el flujo en ${delta}`);
            }

            await delay(3000);
        }
        console.clear();
    }
}

async function flujo_visualization_trayectorias() {
    // Inicialización de flujos
    edges.forEach(edge => {
        edge.flujo = 0;
    });
    console.log("Se inicializan los flujos en 0");
    draw();
    await delay(2500);

    let whileCount = 0;
    while (true) {
        whileCount++;
        console.log(`W1${subscript(whileCount)}:\n`);

        // Inicialización de etiquetas

        nodes.forEach(node => {
            node.value = null;
            node.predecessor = null;
        });
        console.log("Se eliminan las etiquetas");
        draw();
        await delay(2000);
        let U = [];

        // Inicialización de la fuente
        fuenteNode.value = Infinity;
        fuenteNode.predecessor = "-";
        U.push(fuenteNode);
        let nestedWhileCount = 0;
        while (sumideroNode.value === null) {
            nestedWhileCount++;
            console.clear();
            console.log(`W1${subscript(whileCount)}-W1${subscript(nestedWhileCount)}:\n`);
            if (U.length === 0) {
                console.log("No hay más nodos en U");
                await delay(2000);
                console.clear();
                draw();
                mostrar_resultado();
                return;
            }

            let u = U.shift();
            let i = 0
            for (; i < edges.length; i++) {
                const edge = edges[i];

                if (edge.startNode === u && edge.starting === u) {
                    const v = edge.endNode;
                    const residualCapacity = edge.label - edge.flujo;

                    if (residualCapacity <= 0) {
                        continue;
                    }

                    if (v.value !== null) {
                        continue;
                    }

                    v.value = Math.min(u.value, residualCapacity);
                    v.predecessor = u.label + "\u207A"; // Unicode for superscript plus sign
                    U.push(v);
                }
            }

            i = 0;
            for (; i < edges.length; i++) {
                const edge = edges[i];
                if (edge.endNode === u && edge.starting !== u) {
                    const v = edge.startNode;

                    if (edge.flujo <= 0) {
                        continue;
                    }

                    if (v.value !== null) {
                        continue;
                    }

                    v.value = Math.min(u.value, edge.flujo);
                    v.predecessor = u.label + "\u207B";
                    U.push(v);
                }
            }
            if (sumideroNode.value !== null) {
                console.log("Se ha encontrado una trayectoria de la fuente al sumidero");
                draw();
                await delay(5000);
                console.clear();
            }
        }
        let v = sumideroNode;
        let path = [v];
        const printReversePath = () => path.map(node => node.label).reverse().join(" -> "); // Lambda function to print the path in reverse

        let iteration = 1;
        while (v.predecessor.replace(/\u207A|\u207B/g, '') !== "-") {
            v = nodes.find(node => node.label === v.predecessor.replace(/\u207A|\u207B/g, ''));
            path.push(v);
            iteration++;
        }

        console.clear();
        let tray = printReversePath();
        let delta = sumideroNode.value;

        console.log("Trayectoria encontrada:", tray);
        trayectorias.push([tray, delta]);
        await delay(4000);

        // me quedé aquí
        i = 0;
        for (; i < path.length - 1; i++) {
            console.log(`W1${subscript(whileCount)}-F2${subscript(i + 1)}:\n`);
            const u = path[i];
            const v = path[i + 1];
            console.log(`(${v.label}, ${u.label}): `);
            const edge = edges.find(edge => edge.startNode === v && edge.endNode === u && edge.starting === v);
            if (edge) {
                edge.flujo += delta;
                const inverseEdge = edges.find(edge => edge.startNode === u && edge.endNode === v && edge.starting === v);
                inverseEdge.flujo += delta;
                console.log(`Se aumenta el flujo en ${delta}`);
            } else {
                const edge = edges.find(edge => edge.startNode === u && edge.endNode === v && edge.starting === u);
                const inverseEdge = edges.find(edge => edge.startNode === v && edge.endNode === u && edge.starting === u);
                edge.flujo -= delta;
                inverseEdge.flujo -= delta;
                console.log(`Se disminuye el flujo en ${delta}`);
            }

        }
        await delay(5000);
        console.clear();
    }
}


function sum_flow(list) {
    var sum = list.reduce((a, b) => a + b, 0);
    var str = "";

    if (list.length <= 1) {
        str += sum;
    } else {
        str += list.join(" + ") + " = " + sum;
    }

    return str;
}

function get_flujo_maximo() {
    var fuente_connections = [], sumidero_connections = [];
    edges.forEach(edge => {
        if (edge.endNode === sumideroNode && edge.starting != sumideroNode) {
            sumidero_connections.push(edge);
        }
        if (edge.startNode === fuenteNode && edge.starting === fuenteNode) {
            fuente_connections.push(edge);
        }
    });

    var sum_fuente = [], sum_sumidero = [];

    var str_FM_fuente = "|f| a partir de la fuente:\n";
    var str_FM_sumidero = "|f| a partir del sumidero:\n";
    fuente_connections.forEach(edge => {
        str_FM_fuente += `(${edge.startNode.label}, ${edge.endNode.label}), `;
        str_FM_fuente += `|f| += ${edge.flujo}\n`;
        sum_fuente.push(edge.flujo);
    });

    sumidero_connections.forEach(edge => {
        str_FM_sumidero += `(${edge.startNode.label}, ${edge.endNode.label}), `;
        str_FM_sumidero += `|f| += ${edge.flujo}\n`;
        sum_sumidero.push(edge.flujo);
    });

    var sum = sum_fuente.reduce((a, b) => a + b, 0);

    str_FM_fuente += "|f| = " + sum_flow(sum_fuente);
    str_FM_sumidero += "|f| = " + sum_flow(sum_sumidero);

    return { str_FM_fuente, str_FM_sumidero, sum};
}

function getMinCutNodes() {
    if (!fuenteNode || !sumideroNode) return { visitedNodes: [], notVisitedNodes: [] };

    const labelledNodes = nodes.filter(node => node.value !== null || node.predecessor !== null);
    const notLabelledNodes = nodes.filter(node => node.value === null && node.predecessor === null);

    return { labelledNodes, notLabelledNodes };
}

function findMinCutEdges(minCutStartingNodes, minCutEndingNodes) {
    const { visitedNodes, notVisitedNodes } = { visitedNodes: minCutStartingNodes, notVisitedNodes: minCutEndingNodes };
    const minCutEdges = [];

    visitedNodes.forEach(visitedNode => {
        notVisitedNodes.forEach(notVisitedNode => {
            const edge = edges.find(edge => edge.startNode === visitedNode && edge.endNode === notVisitedNode);
            if (edge) {
                minCutEdges.push(edge);
            }
        });
    });

    return minCutEdges;
}

//Not expected. To review
function drawMinCut(minCutEdges) {
    if (!fuenteNode || !sumideroNode) {
        return;
    }

    minCutEdges.forEach(edge => {
        var { startNode, endNode } = edge;

        ctx.strokeStyle = 'green';
        ctx.lineWidth = 3;

        if (edge.starting != edge.startNode) {
            var tmp = startNode;
            startNode = endNode;
            endNode = tmp;
            ctx.strokeStyle = 'blue';
        }
        const angle = Math.atan2(endNode.y - startNode.y, endNode.x - startNode.x);
        var startX = startNode.x + 20 * Math.cos(angle);
        var startY = startNode.y + 20 * Math.sin(angle);
        var endX = endNode.x - 20 * Math.cos(angle);
        var endY = endNode.y - 20 * Math.sin(angle);

        // Draw the edge line
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Draw the arrowhead
        const arrowLength = 10;
        const arrowWidth = 7;

        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - arrowLength * Math.cos(angle - Math.PI / 6),
            endY - arrowLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            endX - arrowLength * Math.cos(angle + Math.PI / 6),
            endY - arrowLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = ctx.strokeStyle; // Match arrowhead color to edge color
        ctx.fill();

        // Draw the label with capacity/flujo
        if (edge.label !== undefined) {
            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;

            ctx.save();
            ctx.font = '16px Arial';
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'black';
            ctx.fillStyle = 'white';

            const labelText = edge.flujo !== undefined ? `${infLabel(edge.label)}/${edge.flujo}` : edge.label.toString();
            ctx.strokeText(labelText, midX, midY);
            ctx.fillText(labelText, midX, midY);

            ctx.restore();
        }
    });

    // Reset lineWidth after drawing min-cut edges
    ctx.lineWidth = 1;
}

function mostrar_resultado() {
    var {str_FM_fuente: detail_fuente, str_FM_sumidero: detail_sumidero, sum: max_flow} = get_flujo_maximo();

    let result = `El flujo máximo es ${max_flow} 
                \nLas trayectorias usadas son:`;

    trayectorias.forEach(trayectoria => {
        result += `\n${trayectoria[0]} con un flujo de ${trayectoria[1]}`;
    });

    result += "\n\n" + detail_fuente + "\n\n" + detail_sumidero;

    const { labelledNodes: minCutStartingNodes, notLabelledNodes: minCutEndingNodes } = getMinCutNodes();

    result += "\n\nEl corte mínimo es: ({";
    result += minCutStartingNodes.map(node => node.label).join(", ");
    result += "}; {";
    result += minCutEndingNodes.map(node => node.label).join(", ");
    result += "})";

    result += "\nLas aristas del corte mínimo son:\n";

    const minimun_cut = findMinCutEdges(minCutStartingNodes, minCutEndingNodes);

    var flujo_max_minimun_cut = [];
    minimun_cut.forEach(edge => {
        if (edge.starting === edge.startNode) {
            result += `(${edge.startNode.label}, ${edge.endNode.label}), `;
            result += `|f| += ${edge.flujo}\n`;
            flujo_max_minimun_cut.push(edge.flujo);
        } else {
            result += `(${edge.endNode.label}, ${edge.startNode.label}), `;
            result += `flujo = ${edge.flujo}\n`;
        }
    });

    result += "|f| del corte mínimo = ";
    result += sum_flow(flujo_max_minimun_cut);

    drawMinCut(minimun_cut);

    console.log(result);
}