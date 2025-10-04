// 初始化地图 - 使用深色主题
var map = L.map('map', {
    zoomControl: false
}).setView([30, 110], 3);

// 使用CartoDB深色地图
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap, © CartoDB',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

// 添加缩放控件到右下角
L.control.zoom({
    position: 'bottomright'
}).addTo(map);

// 状态变量
var currentColor = '#ff6b6b';
var pixelCount = 0;
var markers = [];

// 颜色选择器
document.getElementById('colorInput').addEventListener('input', function(e) {
    currentColor = e.target.value;
});

// 点击地图添加像素
map.on('click', function(e) {
    // 创建像素标记
    var pixel = L.circleMarker(e.latlng, {
        radius: 8,
        fillColor: currentColor,
        color: currentColor,
        fillOpacity: 0.9,
        opacity: 1,
        weight: 2
    }).addTo(map);
    
    // 添加动画效果
    pixel.setStyle({ radius: 0 });
    setTimeout(function() {
        pixel.setStyle({ radius: 8 });
    }, 50);
    
    // 添加发光效果
    pixel._path.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))';
    
    // 绑定弹出窗口
    pixel.bindPopup(`
        <div style="text-align: center; padding: 8px;">
            <div style="width: 20px; height: 20px; background: ${currentColor}; 
                       border-radius: 50%; margin: 0 auto 8px;"></div>
            <div style="font-weight: 600;">像素创作</div>
            <div style="font-size: 11px; color: #666; margin-top: 4px;">
                坐标: ${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}
            </div>
        </div>
    `);
    
    markers.push(pixel);
    pixelCount++;
    document.getElementById('pixelCount').textContent = pixelCount;
    
    // 涟漪动画
    var ripple = L.circle(e.latlng, {
        radius: 2,
        color: currentColor,
        fillColor: currentColor,
        fillOpacity: 0.3,
        opacity: 1
    }).addTo(map);
    
    var radius = 2;
    function animateRipple() {
        radius += 6;
        ripple.setRadius(radius);
        ripple.setStyle({
            fillOpacity: 0.3 * (1 - radius / 40),
            opacity: 1 - radius / 40
        });
        
        if (radius < 40) {
            requestAnimationFrame(animateRipple);
        } else {
            map.removeLayer(ripple);
        }
    }
    animateRipple();
});

// 添加一些示例像素
setTimeout(function() {
    var examples = [
        { lat: 39.9042, lng: 116.4074, color: '#ff6b6b' },
        { lat: 40.7128, lng: -74.0060, color: '#4ecdc4' },
        { lat: 48.8566, lng: 2.3522, color: '#45b7d1' },
        { lat: 35.6762, lng: 139.6503, color: '#96ceb4' }
    ];
    
    examples.forEach(function(point) {
        var marker = L.circleMarker([point.lat, point.lng], {
            radius: 6,
            fillColor: point.color,
            color: point.color,
            fillOpacity: 0.7
        }).addTo(map).bindPopup('示例像素');
        
        markers.push(marker);
        pixelCount++;
    });
    
    document.getElementById('pixelCount').textContent = pixelCount;
}, 1000);

console.log('🎨 MapMosaic 加载完成！');
