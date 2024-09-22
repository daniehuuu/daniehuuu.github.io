const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');
const contextMenu = document.getElementById('contextMenu');
const changeLabelOption = document.getElementById('changeLabel');
const connectNodeOption = document.getElementById('connectNode');
const deleteNodeOption = document.getElementById('deleteNode');
const clearGraphButton = document.getElementById('clearGraphButton');
const grafoDemoButton = document.getElementById('demoButton');
const simpleDemoButton = document.getElementById('simpleDemoButton');
const yetAnotherDemoButton = document.getElementById('yetAnotherDemoButton');
const setFuenteOption = document.getElementById('setFuente'); // Option for Fuente
const setSumideroOption = document.getElementById('setSumidero'); // Option for Sumidero
const logsDiv = document.getElementById('logs');
const iniciarAlgoritmoButton = document.getElementById('iniciarAlgoritmo');

//edges
const contextMenuNode = document.getElementById('contextMenuNode');
const contextMenuEdge = document.getElementById('contextMenuEdge');
const editEdgeLabelOption = document.getElementById('editEdgeLabel');
const deleteEdgeOption = document.getElementById('deleteEdge');

let nodes = [];
let edges = [];
let selectedNode = null;
let selectedEdge = null; // Track the selected edge
let isDragging = false;
let nodeToConnect = null;
let fuenteNode = null; // Track the current "Fuente" node
let sumideroNode = null; // Track the current "Sumidero" node
let algorithmStarted = false;
let trayectorias = [];


canvas.addEventListener('dblclick', addNode);
canvas.addEventListener('click', selectNode);
canvas.addEventListener('mousedown', startDrag);
canvas.addEventListener('mousemove', dragNode);
canvas.addEventListener('mouseup', endDrag);
canvas.addEventListener('contextmenu', showContextMenu);

changeLabelOption.addEventListener('click', changeLabel);
connectNodeOption.addEventListener('click', connectNodes);
deleteNodeOption.addEventListener('click', deleteNode);
setFuenteOption.addEventListener('click', toggleFuenteNode); // Updated event listener
setSumideroOption.addEventListener('click', toggleSumideroNode); // New event listener

//edges
editEdgeLabelOption.addEventListener('click', editEdgeLabel);
deleteEdgeOption.addEventListener('click', deleteEdge);

iniciarAlgoritmoButton.addEventListener('click', iniciarAlgoritmo);
grafoDemoButton.addEventListener('click', grafoDemo);
simpleDemoButton.addEventListener('click', simpleDemo);
yetAnotherDemoButton.addEventListener('click', yetAnotherDemo);
clearGraphButton.addEventListener('click', clearGraph);

function addNode(event) {
    const x = event.offsetX;
    const y = event.offsetY;
    nodes.push({ 
        id: nodes.length, 
        x, 
        y, 
        label: `Node ${nodes.length}`, 
        isFuente: false, 
        isSumidero: false, 
        predecessor: null, 
        value: null 
    });
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

function isPositiveInteger(value) {
    const number = Number(value);
    return Number.isInteger(number) && number > 0;
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
        if(selectedNode.isFuente){
            alert('La fuente no puede ser un nodo de entrada');
            nodeToConnect = null;
            draw();
            return;
        }
        if(nodeToConnect.isSumidero){
            alert('El sumidero no puede ser un nodo de salida');
            nodeToConnect = null;
            draw();
            return;
        }
        let edgeLabel;
        let infOp = ["inf", "infty", "infinity"];
        do {
            edgeLabel = prompt('Enter edge label (positive integer):', '');
            if (edgeLabel === null) {
                nodeToConnect = null;
                connectNodeOption.textContent = 'Connect Node';
                contextMenu.style.display = 'none'; // Hide the context menu
                draw();
                return;
            }
        } while (!isPositiveInteger(edgeLabel) && !infOp.includes(edgeLabel));

        if(infOp.includes(edgeLabel)){
            edgeLabel = Infinity;
        }
        // Store both directions internally
        edges.push({ startNode: nodeToConnect, endNode: selectedNode, label: edgeLabel, starting: nodeToConnect });

        edges.push({ startNode: selectedNode, endNode: nodeToConnect, label: edgeLabel, starting: nodeToConnect });

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

    if(selectedNode.isFuente){
        fuenteNode = null;
    }

    if(selectedNode.isSumidero){
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
    let infOp = ["inf", "infty", "infinity"];
    do {
        newLabel = prompt('Enter new edge label (positive integer):', selectedEdge.label);
        if (newLabel === null) {
            // User cancelled the prompt, exit the function
            contextMenuEdge.style.display = 'none';
            return;
        }
    } while (!isPositiveInteger(newLabel) && !infOp.includes(newLabel));

    if(infOp.includes(newLabel)){
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
    if (contextMenuNode) {
        contextMenuNode.style.display = 'none';
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
        if (contextMenuNode) {
            contextMenuNode.style.display = 'none';
        }
        if (contextMenuEdge) {
            contextMenuEdge.style.display = 'none';
        }
    }
});

canvas.addEventListener('contextmenu', function(event) {
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
            if(someNodeConnectsNode(selectedNode)){
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
            if(nodeConnectsAnother(selectedNode)){
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
        if(node.value === Infinity){
            ctx.fillText(`[${node.predecessor}; ∞]`, node.x - 15, node.y - 22);
        }else{
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
                if(label === Infinity){
                    ctx.strokeText(`∞/${flujo}`, midX, midY);
                    ctx.fillText(`∞/${flujo}`, midX, midY);
                }else{
                    ctx.strokeText(`${label}/${flujo}`, midX, midY);
                    ctx.fillText(`${label}/${flujo}`, midX, midY);
                }
            } else {
                if(label === Infinity){
                    ctx.strokeText(`∞`, midX, midY);
                    ctx.fillText(`∞`, midX, midY);
                }else{
                    ctx.strokeText(label, midX, midY);
                    ctx.fillText(label, midX, midY);
                }
            }
            // Restore the context state to avoid affecting other drawings
            ctx.restore();
        }
    }
}

function grafoDemo(){
    var halfHeight = canvas.height/2;
    nodes.push({ id: "a", x: 100, y: halfHeight, label: 'a', isFuente: true, isSumidero: false, predecessor: null, value: null});
    nodes.push({ id: "A", x: 300, y: halfHeight - 200, label: 'A', isFuente: false, isSumidero: false, predecessor: null, value: null});
    nodes.push({ id: "B", x: 300, y: halfHeight, label: 'B', isFuente: false, isSumidero: false, predecessor: null, value: null});
    nodes.push({ id: "C", x: 300, y: 200 + halfHeight, label: 'C', isFuente: false, isSumidero: false, predecessor: null, value: null});
    nodes.push({ id: "Z1", x: 450, y: halfHeight - 200, label: 'Z1', isFuente: false, isSumidero: false, predecessor: null, value: null});
    nodes.push({ id: "Z2", x: 550, y: halfHeight, label: 'Z2', isFuente: false, isSumidero: false, predecessor: null, value: null});
    nodes.push({ id: "Z3", x: 450, y: 270 + halfHeight, label: 'Z3', isFuente: false, isSumidero: false, predecessor: null, value: null});
    nodes.push({ id: "Z", x: 700, y: halfHeight, label: 'Z', isFuente: false, isSumidero: true, predecessor: null, value: null});
 
 
    edges.push({ startNode: nodes[0], endNode: nodes[1], label: '1', starting: nodes[0] });
    edges.push({ startNode: nodes[0], endNode: nodes[2], label: '1', starting: nodes[0] });
    edges.push({ startNode: nodes[0], endNode: nodes[3], label: '1', starting: nodes[0] });
    edges.push({ startNode: nodes[1], endNode: nodes[4], label: '1', starting: nodes[1] });
    edges.push({ startNode: nodes[1], endNode: nodes[6], label: '1', starting: nodes[1] });
    edges.push({ startNode: nodes[2], endNode: nodes[4], label: '1', starting: nodes[2] });
    edges.push({ startNode: nodes[2], endNode: nodes[5], label: '1', starting: nodes[2] });
    edges.push({ startNode: nodes[3], endNode: nodes[4], label: '1', starting: nodes[3] });
    edges.push({ startNode: nodes[4], endNode: nodes[7], label: '1', starting: nodes[4] });
    edges.push({ startNode: nodes[5], endNode: nodes[7], label: '1', starting: nodes[5] });
    edges.push({ startNode: nodes[6], endNode: nodes[7], label: '1', starting: nodes[6] });
    
    edges.push({ startNode: nodes[1] , endNode: nodes[0], label: '1', starting: nodes[0] });
    edges.push({ startNode: nodes[2] , endNode: nodes[0], label: '1', starting: nodes[0] });
    edges.push({ startNode: nodes[3] , endNode: nodes[0], label: '1', starting: nodes[0] });
    edges.push({ startNode: nodes[4] , endNode: nodes[1], label: '1', starting: nodes[1] });
    edges.push({ startNode: nodes[6] , endNode: nodes[1], label: '1', starting: nodes[1] });
    edges.push({ startNode: nodes[4] , endNode: nodes[2], label: '1', starting: nodes[2] });
    edges.push({ startNode: nodes[5] , endNode: nodes[2], label: '1', starting: nodes[2] });
    edges.push({ startNode: nodes[4] , endNode: nodes[3], label: '1', starting: nodes[3] });
    edges.push({ startNode: nodes[7] , endNode: nodes[4], label: '1', starting: nodes[4] });
    edges.push({ startNode: nodes[7] , endNode: nodes[5], label: '1', starting: nodes[5] });
    edges.push({ startNode: nodes[7] , endNode: nodes[6], label: '1', starting: nodes[6] });
 
    fuenteNode = nodes[0];
    sumideroNode = nodes[7];
    
    draw();
}

function simpleDemo(){
    nodes.push({ id: "a", x: 100, y: canvas.height/2, label: 'a', isFuente: true, isSumidero: false, predecessor: null, value: null});
    nodes.push({ id: "b", x: canvas.width - 100, y: canvas.height/2, label: 'b', isFuente: false, isSumidero: true, predecessor: null, value: null});
    edges.push({ startNode: nodes[0], endNode: nodes[1], label: '3', starting: nodes[0] });
    edges.push({ startNode: nodes[1], endNode: nodes[0], label: '3', starting: nodes[0] });
    fuenteNode = nodes[0];
    sumideroNode = nodes[1];
    draw();
}

function yetAnotherDemo(){
    var halfHeight = canvas.height/2;
    nodes.push({ id: "s", x: 100, y: halfHeight, label: 's', isFuente: true, isSumidero: false, predecessor: null, value: null});
    nodes.push({ id: "A", x: 300, y: halfHeight - 200, label: 'A', isFuente: false, isSumidero: false, predecessor: null, value: null});
    nodes.push({ id: "B", x: 300, y: 200 + halfHeight, label: 'B', isFuente: false, isSumidero: false, predecessor: null, value: null});
    nodes.push({ id: "Y", x: 450, y: halfHeight - 200, label: 'Y', isFuente: false, isSumidero: false, predecessor: null, value: null});
    nodes.push({ id: "X", x: 550, y: halfHeight, label: 'X', isFuente: false, isSumidero: false, predecessor: null, value: null});
    nodes.push({ id: "Z", x: 450, y: 200 + halfHeight, label: 'Z', isFuente: false, isSumidero: false, predecessor: null, value: null});
    nodes.push({ id: "t", x: 700, y: halfHeight, label: 't', isFuente: false, isSumidero: true, predecessor: null, value: null});

    // s -> A (2), s -> B (12), A -> B (3), A -> Y (8), B -> Z (10), Z -> A (6), Y -> X (7), X -> Z (1), Y -> t (2), X -> t(6), Z -> t (5)
    edges.push({ startNode: nodes[0], endNode: nodes[1], label: '2', starting: nodes[0] });
    edges.push({ startNode: nodes[0], endNode: nodes[2], label: '12', starting: nodes[0] });
    edges.push({ startNode: nodes[1], endNode: nodes[2], label: '3', starting: nodes[1] });
    edges.push({ startNode: nodes[1], endNode: nodes[3], label: '8', starting: nodes[1] });
    edges.push({ startNode: nodes[2], endNode: nodes[5], label: '11', starting: nodes[2] });
    edges.push({ startNode: nodes[5], endNode: nodes[1], label: '6', starting: nodes[5] });
    edges.push({ startNode: nodes[3], endNode: nodes[4], label: '7', starting: nodes[3] });
    edges.push({ startNode: nodes[4], endNode: nodes[5], label: '1', starting: nodes[4] });
    edges.push({ startNode: nodes[3], endNode: nodes[6], label: '2', starting: nodes[3] });
    edges.push({ startNode: nodes[4], endNode: nodes[6], label: '7', starting: nodes[4] });
    edges.push({ startNode: nodes[5], endNode: nodes[6], label: '5', starting: nodes[5] });
    //bidrectional edges (same starting node)
    edges.push({ startNode: nodes[1], endNode: nodes[0], label: '2', starting: nodes[0] });
    edges.push({ startNode: nodes[2], endNode: nodes[0], label: '12', starting: nodes[0] });
    edges.push({ startNode: nodes[2], endNode: nodes[1], label: '3', starting: nodes[1] });
    edges.push({ startNode: nodes[3], endNode: nodes[1], label: '8', starting: nodes[1] });
    edges.push({ startNode: nodes[5], endNode: nodes[2], label: '11', starting: nodes[2] });
    edges.push({ startNode: nodes[1], endNode: nodes[5], label: '6', starting: nodes[5] });
    edges.push({ startNode: nodes[4], endNode: nodes[3], label: '7', starting: nodes[3] });
    edges.push({ startNode: nodes[5], endNode: nodes[4], label: '1', starting: nodes[4] });
    edges.push({ startNode: nodes[6], endNode: nodes[3], label: '2', starting: nodes[3] });
    edges.push({ startNode: nodes[6], endNode: nodes[4], label: '7', starting: nodes[4] });
    edges.push({ startNode: nodes[6], endNode: nodes[5], label: '1', starting: nodes[5] });
    
    fuenteNode = nodes[0];
    sumideroNode = nodes[6];

    draw();

}

function clearGraph() {


    nodes = [];
    edges = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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

function iniciarAlgoritmo() {
    // Check if there are nodes, fuente, and sumidero
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

    if(hasPathFromFuenteToSumidero() === false){
        alert('No hay una trayectoria de la fuente al sumidero');
        return;
    }
    // Hide the buttons
    iniciarAlgoritmoButton.style.display = 'none';
    clearGraphButton.style.display = 'none';
    simpleDemoButton.style.display = 'none';
    yetAnotherDemoButton.style.display = 'none';
    grafoDemoButton.style.display = 'none';

    algorithmStarted = true;
    flujo_visualization()
}

function subscript(number) {
    const subscriptDigits = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
    return number.toString().split('').map(digit => subscriptDigits[parseInt(digit)]).join('');
}

function infLabel(label){
    return (label === Infinity) ? "∞" : label;
}

async function flujo_visualization(){
    // Inicialización de flujos
    edges.forEach(edge => {
        edge.flujo = 0;
    });
    console.log("Se inicializan los flujos en 0");
    draw();
    await delay(2500);
    
    let whileCount = 0;
    while(true){
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
        while(sumideroNode.value === null){
            nestedWhileCount++;
            console.clear();
            console.log(`W1${subscript(whileCount)}-W1${subscript(nestedWhileCount)}:\n`);
            if(U.length === 0){
                console.log("No hay más nodos en U");
                //delete the etiqueta of fuente
                await delay(2000);
                fuenteNode.value = null;
                fuenteNode.predecessor = null;
                await delay(2000);
                console.clear();
                draw();
                mostrar_resultado();
                return;
            }

            let u = U.shift();
            let delta = u.value;
            console.log(`Se selecciona el nodo ${u.label}`);
            console.log(`Delta = ${delta}`);
            console.log("U:", `{${U.map(node => node.label).join(", ")}}`);
            await delay(3000);
            console.log(`Se seleccionan conexiones de ${u.label} a otro nodo: `);
            await delay(2000);
            let i = 0
            for (; i < edges.length; i++) {
                const edge = edges[i];
                
                if (edge.startNode === u && edge.starting === u) {
                    console.log(`W1${subscript(whileCount)}-W1${subscript(nestedWhileCount)}-F1${subscript(i+1)}:\n`);
                    const v = edge.endNode;
                    const residualCapacity = edge.label - edge.flujo;

                    console.log(`(${u.label}, ${v.label}): `);
                    
                    if(residualCapacity <= 0){
                        console.log(`La capacidad residual es muy baja: ${residualCapacity}`);
                        await delay(3000);
                        continue;
                    }

                    if(v.value !== null){
                        console.log(`El nodo ${v.label} ya está etiquetado`);
                        await delay(3000);
                        continue;
                    }

                    v.value = Math.min(u.value, residualCapacity);
                    v.predecessor = u.label + "\u207A"; // Unicode for superscript plus sign
                    
                    U.push(v);
                    draw();
                    console.log(`${v.label} no está conectado y la capacidad residual es ${edge.label==Infinity?"∞":edge.label} - ${edge.flujo} = ${residualCapacity}`);
                    console.log(`Predecesor = ${u.label}. min(${u.value}, ${residualCapacity}) = ${v.value}`);
                    await delay(3500);
                }
            }

            console.log(`Se seleccionan conexiones de algun nodo a ${u.label}: `);
            await delay(3000);
            i = 0;
            for (; i < edges.length; i++) {
                const edge = edges[i];
                if (edge.endNode === u && edge.starting !== u) {
                    console.log(`W1${subscript(whileCount)}-W1${subscript(nestedWhileCount)}-F2${subscript(i+1)}:\n`);
                    const v = edge.startNode;
                    console.log(`(${v.label}, ${u.label}): `);

                    if(edge.flujo <= 0){
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
            if(sumideroNode.value !== null){
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
        while(v.predecessor.replace(/\u207A|\u207B/g, '') !== "-"){
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
            console.log(`W1${subscript(whileCount)}-F2${subscript(i+1)}:\n`);
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
                const edge = edges.find(edge => edge.startNode === u && edge.endNode === v && edge.starting === v);
                const inverseEdge = edges.find(edge => edge.startNode === v && edge.endNode === u && edge.starting === v);
                edge.flujo -= delta;
                inverseEdge.flujo -= delta;
                console.log(`Se disminuye el flujo en ${delta}`);
            }

            await delay(3000);
        }
        console.clear();
    }
}



function sumar_flujo_maximo() {
    let sum = 0;
    edges.forEach(edge => {
        if (edge.endNode === sumideroNode) {
            sum += edge.flujo;
        }
    });
   return sum;
}

function getMinCutNodes() {
    if (!fuenteNode || !sumideroNode) return { visitedNodes: [], notVisitedNodes: [] };

    const visited = new Set();
    const stack = [fuenteNode];
    while (stack.length > 0) {
        const currentNode = stack.pop();
        visited.add(currentNode);
        edges.forEach(edge => {
            if (edge.startNode === currentNode && edge.label - edge.flujo > 0 && !visited.has(edge.endNode)) {
                stack.push(edge.endNode);
            }

        });
    }   

    const visitedNodes = Array.from(visited);
    const notVisitedNodes = nodes.filter(node => !visited.has(node));

    return { visitedNodes, notVisitedNodes };
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
        const { startNode, endNode } = edge;
        const angle = Math.atan2(endNode.y - startNode.y, endNode.x - startNode.x);
        const startX = startNode.x + 20 * Math.cos(angle);
        const startY = startNode.y + 20 * Math.sin(angle);
        const endX = endNode.x - 20 * Math.cos(angle);
        const endY = endNode.y - 20 * Math.sin(angle);

        // Set style for min-cut edges
        ctx.strokeStyle = edge.starting === edge.startNode ? 'green' : 'blue';
        ctx.lineWidth = 3;

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

            const labelText = edge.flujo !== undefined ? `${edge.label}/${edge.flujo}` : edge.label.toString();
            ctx.strokeText(labelText, midX, midY);
            ctx.fillText(labelText, midX, midY);

            ctx.restore();
        }
    });

    // Reset lineWidth after drawing min-cut edges
    ctx.lineWidth = 1;
}


function mostrar_resultado(){
    let maxFlow = sumar_flujo_maximo();
    let result = `El flujo máximo es ${maxFlow} \n\nLas trayectorias usadas son:`;
    trayectorias.forEach(trayectoria => {
        result += `\n${trayectoria[0]} con un flujo de ${trayectoria[1]}`;
    });


    const { visitedNodes: minCutStartingNodes, notVisitedNodes: minCutEndingNodes } = getMinCutNodes();

    result += "\n\nEl corte mínimo es: ({";
    result += minCutStartingNodes.map(node => node.label).join(", ");
    result += "}; {";
    result += minCutEndingNodes.map(node => node.label).join(", ");
    result += "})";

    result += "\nLas aristas del corte mínimo son:\n";

    const minimun_cut = findMinCutEdges(minCutStartingNodes, minCutEndingNodes);
    minimun_cut.forEach(edge => {
        result += `(${edge.startNode.label}, ${edge.endNode.label}), `;
        result += `${edge.starting === edge.startNode ? '+' : '-'}${edge.flujo}\n`;
    });
  
    drawMinCut(minimun_cut);

    console.log(result);
}