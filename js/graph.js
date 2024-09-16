const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');
const contextMenu = document.getElementById('contextMenu');
const changeLabelOption = document.getElementById('changeLabel');
const connectNodeOption = document.getElementById('connectNode');
const deleteNodeOption = document.getElementById('deleteNode');
const clearGraphButton = document.getElementById('clearGraphButton');
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

clearGraphButton.addEventListener('click', clearGraph);
iniciarAlgoritmoButton.addEventListener('click', iniciarAlgoritmo);

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
        let edgeLabel;
        do {
            edgeLabel = prompt('Enter edge label (positive integer):', '');
            if (edgeLabel === null) {
                nodeToConnect = null;
                connectNodeOption.textContent = 'Connect Node';
                contextMenu.style.display = 'none'; // Hide the context menu
                draw();
                return;
            }
        } while (!isPositiveInteger(edgeLabel));

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
    nodes = nodes.filter(node => node !== selectedNode);
    edges = edges.filter(edge => edge.startNode !== selectedNode && edge.endNode !== selectedNode);
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
    do {
        newLabel = prompt('Enter new edge label (positive integer):', selectedEdge.label);
        if (newLabel === null) {
            // User cancelled the prompt, exit the function
            contextMenuEdge.style.display = 'none';
            return;
        }
    } while (!isPositiveInteger(newLabel));

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
    contextMenuNode.style.display = 'none';
    contextMenuEdge.style.display = 'none';
});

canvas.addEventListener('contextmenu', function (event) {
    const x = event.offsetX;
    const y = event.offsetY;

    if (getEdgeAt(x, y)) {
        showContextMenu(event);
    } else if (getNodeAt(x, y)) {
        showContextMenu(event);
    } else {
        contextMenuNode.style.display = 'none';
        contextMenuEdge.style.display = 'none';
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
        ctx.fillText(`[${node.predecessor}; ${node.value}]`, node.x - 15, node.y - 22);
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
                ctx.strokeText(`${label}/${flujo}`, midX, midY);
                ctx.fillText(`${label}/${flujo}`, midX, midY);
            } else {
                ctx.strokeText(label, midX, midY);
                ctx.fillText(label, midX, midY);
            }

            // Restore the context state to avoid affecting other drawings
            ctx.restore();
        }
    }
}

function clearGraph() {
    /*
    nodes = [];
    edges = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    */
   // code for testing the graph
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
   fuenteNode = nodes[0];
   sumideroNode = nodes[7];
   
   draw();
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

    // Hide the buttons
    iniciarAlgoritmoButton.style.display = 'none';
    clearGraphButton.style.display = 'none';
    algorithmStarted = true;

    // Step 1: Initialize all edge flows to 0
    initializeFlows();
}

function initializeFlows() {
    edges.forEach(edge => {
        edge.flujo = 0;
    });
    console.log("Se inicializan los flujos en 0");
    draw();

    // Step 2: Clear node labels after the edges have been initialized
    setTimeout(clearNodeLabels, 1000);
}

function clearNodeLabels() {
    nodes.forEach(node => {
        node.value = null;
        node.predecessor = null;
    });
    console.log("Se eliminan las etiquetas");
    draw();

    // Step 3: Initialize the fuente node
    setTimeout(initializeFuente, 1000);
}

function initializeFuente() {
    console.log("Se etiqueta la fuente");
    fuenteNode.value = "∞";
    fuenteNode.predecessor = "-";
    draw();
    
    // You can add further steps here to continue the algorithm flow...
}

