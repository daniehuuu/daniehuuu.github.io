const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');
const contextMenu = document.getElementById('contextMenu');
const changeLabelOption = document.getElementById('changeLabel');
const connectNodeOption = document.getElementById('connectNode');
const deleteNodeOption = document.getElementById('deleteNode');
const clearGraphButton = document.getElementById('clearGraphButton');


//edges
const contextMenuNode = document.getElementById('contextMenuNode');
const contextMenuEdge = document.getElementById('contextMenuEdge');
const editEdgeLabelOption = document.getElementById('editEdgeLabel');
const deleteEdgeOption = document.getElementById('deleteEdge');


let nodes = [];
let edges = [];
let selectedNode = null;
let isDragging = false;
let nodeToConnect = null;

canvas.addEventListener('dblclick', addNode);
canvas.addEventListener('click', selectNode);
canvas.addEventListener('mousedown', startDrag);
canvas.addEventListener('mousemove', dragNode);
canvas.addEventListener('mouseup', endDrag);
canvas.addEventListener('contextmenu', showContextMenu);

changeLabelOption.addEventListener('click', changeLabel);
connectNodeOption.addEventListener('click', connectNodes);
deleteNodeOption.addEventListener('click', deleteNode);


//edges
editEdgeLabelOption.addEventListener('click', editEdgeLabel);
deleteEdgeOption.addEventListener('click', deleteEdge);


clearGraphButton.addEventListener('click', clearGraph);

function addNode(event) {
    const x = event.offsetX;
    const y = event.offsetY;
    nodes.push({ id: nodes.length, x, y, label: `Node ${nodes.length}` });
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

function showContextMenu(event) {
    event.preventDefault();
    const x = event.offsetX;
    const y = event.offsetY;
    selectedNode = getNodeAt(x, y);
    if (selectedNode) {
        contextMenu.style.display = 'block';
        contextMenu.style.left = `${event.pageX}px`;
        contextMenu.style.top = `${event.pageY}px`;
    }
}

function changeLabel() {
    const newLabel = prompt('Enter new label:', selectedNode.label);
    if (newLabel !== null) {
        selectedNode.label = newLabel;
        draw();
    }
    contextMenu.style.display = 'none';
}

function isPositiveInteger(value) {
    const number = Number(value);
    return Number.isInteger(number) && number > 0;
}

function connectNodes() {
    if (nodeToConnect) {
        let edgeLabel;
        do {
            edgeLabel = prompt('Enter edge label (positive integer):', '');
            if (edgeLabel === null) {
                nodeToConnect = null;
                contextMenu.style.display = 'none';
                return;
            }
        } while (!isPositiveInteger(edgeLabel));

        edges.push({ startNode: nodeToConnect, endNode: selectedNode, label: edgeLabel });
        nodeToConnect = null;
        draw();
    } else {
        nodeToConnect = selectedNode;
        draw();
    }
    contextMenu.style.display = 'none';
}

function getNodeAt(x, y) {
    return nodes.find(node => Math.hypot(node.x - x, node.y - y) < 20);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    edges.forEach(drawEdge);
    nodes.forEach(drawNode);
}

function drawNode(node) {
    ctx.beginPath();
    ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
    ctx.fillStyle = node === nodeToConnect ? 'red' : 'blue';
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.stroke();
    ctx.fillStyle = 'white';
    ctx.fillText(node.label, node.x - 10, node.y + 5);
}

function drawEdge(edge) {
    const { startNode, endNode, label } = edge;
    
    const angle = Math.atan2(endNode.y - startNode.y, endNode.x - startNode.x);

    const startX = startNode.x + 20 * Math.cos(angle);
    const startY = startNode.y + 20 * Math.sin(angle);
    const endX = endNode.x - 20 * Math.cos(angle);
    const endY = endNode.y - 20 * Math.sin(angle);

    // Set stroke color to white for the edge line
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();  // Now the line will be white
    
    const arrowLength = 10;
    const arrowWidth = 7;

    // Set fill style to white for the arrow
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

    // Set text color to white for the label
    if (label) {
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        ctx.fillStyle = 'white';
        ctx.fillText(label, midX, midY);
    }
}


function deleteNode() {
    if (!selectedNode) return;
    nodes = nodes.filter(node => node !== selectedNode);
    edges = edges.filter(edge => edge.startNode !== selectedNode && edge.endNode !== selectedNode);
    draw();
    contextMenu.style.display = 'none';
}

function clearGraph() {
    nodes = [];
    edges = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function showEdgeContextMenu(event) {
    event.preventDefault();
    const x = event.offsetX;
    const y = event.offsetY;

    const clickedEdge = getEdgeAt(x, y);
    if (clickedEdge) {
        selectedEdge = clickedEdge;

        contextMenuEdge.style.display = 'block';
        contextMenuEdge.style.left = `${event.pageX}px`;
        contextMenuEdge.style.top = `${event.pageY}px`;

        contextMenuNode.style.display = 'none';
    }
}

canvas.addEventListener('contextmenu', function(event) {
    const x = event.offsetX;
    const y = event.offsetY;

    if (getEdgeAt(x, y)) {
        showEdgeContextMenu(event);
    } else if (getNodeAt(x, y)) {
        showNodeContextMenu(event);
    } else {
        contextMenuNode.style.display = 'none';
        contextMenuEdge.style.display = 'none';
    }
});

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