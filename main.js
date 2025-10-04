// 配置
const CONFIG = {
    mapStyle: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    initialView: {
        center: [0, 20],
        zoom: 1.5,
        pitch: 0,
        bearing: 0
    },
    colors: [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
        '#F8C471', '#82E0AA', '#F1948A', '#7BDFF2', '#D7BDE2'
    ]
};

// 全局状态
let map;
let currentColor = CONFIG.colors[0];
let pixels = [];
let pixelCount = 0;

// 初始化应用
function initApp() {
    initMap();
    initColorGrid();
    initEvents();
    hideLoading();
    
    // 添加示例像素
    setTimeout(addExamplePixels, 1000);
}

// 初始化地图
function initMap() {
    map = new maplibregl.Map({
        container: 'map',
        style: CONFIG.mapStyle,
        center: CONFIG.initialView.center,
        zoom: CONFIG.initialView.zoom,
        pitch: CONFIG.initialView.pitch,
        bearing: CONFIG.initialView.bearing,
        antialias: true
    });

    // 添加导航控件
    map.addControl(new maplibregl.NavigationControl({
        showCompass: true,
        showZoom: true
    }), 'top-right');
}

// 初始化颜色网格
function initColorGrid() {
    const colorGrid = document.getElementById('colorGrid');
    colorGrid.innerHTML = '';

    CONFIG.colors.forEach(color => {
        const colorOption = document.createElement('div');
        colorOption.className = `color-option ${color === currentColor ? 'active' : ''}`;
        colorOption.style.backgroundColor = color;
        colorOption.setAttribute('data-color', color);
        colorOption.onclick = () => selectColor(color);
        colorGrid.appendChild(colorOption);
    });

    // 自定义颜色选择器
    document.getElementById('customColor').addEventListener('input', (e) => {
        selectColor(e.target.value);
    });
}

// 选择颜色
function selectColor(color) {
    currentColor = color;
    
    // 更新UI
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('active');
    });
    
    const selectedOption = document.querySelector(`.color-option[data-color="${color}"]`);
    if (selectedOption) {
        selectedOption.classList.add('active');
    }
    
    document.getElementById('customColor').value = color;
}

// 初始化事件
function initEvents() {
    // 地图点击事件
    map.on('click', (e) => {
        placePixel(e.lngLat);
    });

    // 鼠标移动显示坐标
    map.on('mousemove', (e) => {
        updateCoordinates(e.lngLat);
    });

    // 地图加载完成
    map.on('load', () => {
        console.log('🎨 Pixel Canvas 地图加载完成！');
        initPixelLayer();
    });
}

// 初始化像素图层
function initPixelLayer() {
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
                'circle-radius': 6,
                'circle-color': ['get', 'color'],
                'circle-opacity': 0.9,
                'circle-stroke-width': 2,
                'circle-stroke-color': ['get', 'color'],
                'circle-stroke-opacity': 1,
                'circle-translate': [0, 0]
            }
        });
    }
}

// 放置像素
function placePixel(lngLat) {
    const pixelId = `pixel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
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

    // 更新数据源
    const source = map.getSource('pixels');
    const currentData = source._data;
    currentData.features.push(newPixel);
    source.setData(currentData);

    pixels.push(newPixel);
    pixelCount++;
    updateStats();

    // 动画效果
    animatePixelPlacement(lngLat);
}

// 像素放置动画
function animatePixelPlacement(lngLat) {
    // 创建临时动画元素
    const animationElement = document.createElement('div');
    animationElement.style.cssText = `
        position: absolute;
        width: 12px;
        height: 12px;
        background: ${currentColor};
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
        transform: translate(-50%, -50%);
        box-shadow: 0 0 20px ${currentColor};
    `;
    
    const pixel = map.project(lngLat);
    animationElement.style.left = pixel.x + 'px';
    animationElement.style.top = pixel.y + 'px';
    
    document.getElementById('map').appendChild(animationElement);
    
    // 动画
    let scale = 0;
    const animate = () => {
        scale += 0.1;
        animationElement.style.transform = `translate(-50%, -50%) scale(${scale})`;
        animationElement.style.opacity = 1 - scale;
        
        if (scale < 2) {
            requestAnimationFrame(animate);
        } else {
            animationElement.remove();
        }
    };
    
    animate();
}

// 更新坐标显示
function updateCoordinates(lngLat) {
    document.getElementById('coordinates').textContent = 
        `经纬度: ${lngLat.lng.toFixed(4)}, ${lngLat.lat.toFixed(4)}`;
}

// 更新统计信息
function updateStats() {
    document.getElementById('pixelCount').textContent = pixelCount;
}

// 隐藏加载动画
function hideLoading() {
    setTimeout(() => {
        document.getElementById('loading').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
        }, 500);
    }, 1000);
}

// 添加示例像素
function addExamplePixels() {
    const examples = [
        { lng: 116.4074, lat: 39.9042, color: '#FF6B6B' },
        { lng: -74.0060, lat: 40.7128, color: '#4ECDC4' },
        { lng: 2.3522, lat: 48.8566, color: '#45B7D1' },
        { lng: 139.6503, lat: 35.6762, color: '#96CEB4' },
        { lng: -0.1276, lat: 51.5074, color: '#FFEAA7' }
    ];

    examples.forEach(coord => {
        setTimeout(() => {
            placePixel(coord);
        }, Math.random() * 1000);
    });
}

// 启动应用
document.addEventListener('DOMContentLoaded', initApp);

// 控制台欢迎信息
console.log(`
🎨 Pixel Canvas 已加载!
✨ 功能特色:
   • 现代化 WebGL 地图
   • 流畅的像素动画  
   • 美观的深色主题
   • 实时坐标显示
   • 15种预设颜色
`);
