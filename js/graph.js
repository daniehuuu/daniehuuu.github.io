const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');
const contextMenu = document.getElementById('contextMenu');
const changeLabelOption = document.getElementById('changeLabel');
const connectNodeOption = document.getElementById('connectNode');

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
    if (event.button !== 0) return; // Only allow left-click for dragging
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

function connectNodes() {
    if (nodeToConnect) {
        const edgeLabel = prompt('Enter edge label:', '');
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
    ctx.stroke();
    ctx.fillStyle = 'white';
    ctx.fillText(node.label, node.x - 10, node.y + 5);
}

function drawEdge(edge) {
    const { startNode, endNode, label } = edge;
    ctx.beginPath();
    ctx.moveTo(startNode.x, startNode.y);
    ctx.lineTo(endNode.x, endNode.y);
    ctx.stroke();
    // Add arrowhead
    const angle = Math.atan2(endNode.y - startNode.y, endNode.x - startNode.x);
    ctx.beginPath();
    ctx.moveTo(endNode.x, endNode.y);
    ctx.lineTo(endNode.x - 10 * Math.cos(angle - Math.PI / 6), endNode.y - 10 * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(endNode.x - 10 * Math.cos(angle + Math.PI / 6), endNode.y - 10 * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    // Draw edge label
    if (label) {
        const midX = (startNode.x + endNode.x) / 2;
        const midY = (startNode.y + endNode.y) / 2;
        ctx.fillStyle = 'black';
        ctx.fillText(label, midX, midY);
    }
}

canvas.addEventListener('click', () => {
    contextMenu.style.display = 'none';
});