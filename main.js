// 初始化 MapLibre 地图
const map = new maplibregl.Map({
    container: 'map',
    style: {
        version: 8,
        sources: {
            'osm': {
                type: 'raster',
                tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '© OpenStreetMap'
            }
        },
        layers: [{
            id: 'osm',
            type: 'raster',
            source: 'osm'
        }]
    },
    center: [0, 20],
    zoom: 1.5,
    pitch: 0,
    bearing: 0
});

// 颜色配置
const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
];

let currentColor = colors[0];
let pixels = [];
let pixelCount = 0;

// 初始化颜色网格
function initColorGrid() {
    const grid = document.getElementById('colorGrid');
    colors.forEach(color => {
        const colorOption = document.createElement('div');
        colorOption.className = `color-option ${color === currentColor ? 'active' : ''}`;
        colorOption.style.backgroundColor = color;
        colorOption.onclick = () => selectColor(color);
        grid.appendChild(colorOption);
    });
}

function selectColor(color) {
    currentColor = color;
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('active');
    });
    document.querySelector(`.color-option[style*="${color}"]`).classList.add('active');
}

// 添加像素到地图
function addPixel(lngLat) {
    const pixelId = `pixel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 添加像素点源
    if (!map.getSource('pixels')) {
        map.addSource('pixels', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: []
            }
        });
        
        map.addLayer({
            id: 'pixels',
            type: 'circle',
            source: 'pixels',
            paint: {
                'circle-radius': 8,
                'circle-color': ['get', 'color'],
                'circle-opacity': 0.9,
                'circle-stroke-width': 2,
                'circle-stroke-color': ['get', 'color'],
                'circle-stroke-opacity': 1
            }
        });
    }
    
    // 创建新像素
    const newPixel = {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [lngLat.lng, lngLat.lat]
        },
        properties: {
            id: pixelId,
            color: currentColor,
            timestamp: Date.now()
        }
    };
    
    // 更新数据
    const source = map.getSource('pixels');
    const currentData = source._data;
    currentData.features.push(newPixel);
    source.setData(currentData);
    
    pixels.push(newPixel);
    pixelCount++;
    updateStats();
    
    // 动画效果
    setTimeout(() => {
        map.setPaintProperty('pixels', 'circle-radius', 6);
    }, 50);
}

// 更新统计信息
function updateStats() {
    document.getElementById('pixelCount').textContent = pixelCount;
}

// 坐标显示
function updateCoordinates(lngLat) {
    document.getElementById('coordinates').textContent = 
        `坐标: ${lngLat.lng.toFixed(2)}, ${lngLat.lat.toFixed(2)}`;
}

// 地图事件
map.on('load', () => {
    initColorGrid();
    
    // 点击添加像素
    map.on('click', (e) => {
        addPixel(e.lngLat);
    });
    
    // 鼠标移动显示坐标
    map.on('mousemove', (e) => {
        updateCoordinates(e.lngLat);
    });
});

// 添加一些示例像素
setTimeout(() => {
    const examples = [
        { lng: 116.4074, lat: 39.9042 },
        { lng: -74.0060, lat: 40.7128 },
        { lng: 2.3522, lat: 48.8566 },
        { lng: 139.6503, lat: 35.6762 }
    ];
    
    examples.forEach(coord => {
        addPixel(coord);
    });
}, 2000);
